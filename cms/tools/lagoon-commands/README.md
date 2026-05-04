# run-on-projects.sh

Run one or more shell commands against many Lagoon projects in parallel, with
retries and per-project log files.

## Requirements

- bash (already required across this repo's dev-scripts)
- `lagoon` CLI on your `$PATH` — only needed for the default Lagoon commands;
  the tool itself just runs whatever shell commands you give it
- `xargs`, `awk`, `mkdir` (standard on macOS and Linux)

## Quick start

```sh
# 1. List the projects you want to target, one per line.
$EDITOR projects.txt

# 2. List the commands to run on each project, one per line.
#    Use {project} as a placeholder — it gets replaced per project.
$EDITOR commands.txt

# 3. Run.
./run-on-projects.sh
```

By default the tool uses `projects.txt` and `commands.txt` from the current
directory and runs three projects in parallel.

## Files

- `run-on-projects.sh`: The tool itself.
- `projects.txt`: One project name per line.
- `commands.txt`: One shell command per line. `{project}` is substituted.
- `logs/<timestamp>/<project>.log`: Output of every command for each project.

### `commands.txt` example

```sh
# Default — matches what the old run-project-commands.sh did:
lagoon ssh -p {project} -e main --command "drush status"

# Chain multiple commands per project by adding more lines:
# lagoon ssh -p {project} -e main --command "drush cr"
# lagoon ssh -p {project} -e main --command "drush updb -y"
# lagoon ssh -p {project} -e main --command "drush cim -y"
```

Per project, commands run sequentially in order. If one fails (after retries),
the remaining commands for that project are skipped and it's marked failed.

## Common usage

```sh
# Run with 5 projects in parallel instead of the default 3
./run-on-projects.sh -j 5

# Use a different commands file (e.g. a "cron" preset vs a "cache rebuild" preset)
./run-on-projects.sh -c cron.txt
./run-on-projects.sh -c cache-rebuild.txt

# Re-run only the projects that failed last time
./run-on-projects.sh -p failed.txt

# Preview what would run without executing anything
./run-on-projects.sh --dry-run

# More retries / longer backoff
./run-on-projects.sh -r 8 -d 2
```

## CLI flags

| Flag            | Default         | Description                            |
|-----------------|-----------------|----------------------------------------|
| `--projects`    | `projects.txt`  | File with one project name per line.   |
| `--commands`    | `commands.txt`  | File with one shell command per line.  |
| `--parallel`    | `3`             | Number of projects to run in parallel. |
| `--retries`     | `5`             | Retries per command on non-zero exit.  |
| `--retry-delay` | `1`             | Seconds between retries.               |
| `--log-dir`     | `./logs/<time>` | Where to write per-project log files.  |
| `--dry-run`     | off             | Summary, without running commands.     |

## Reading site output

Everything each project's commands print is captured to
`logs/<timestamp>/<project>.log`. The end of every run shows the exact path so
you can inspect:

```sh
cat   logs/20260501-085707/aarhus.log     # one project
less  logs/20260501-085707/*.log          # all of them, paged
```

You can also tail a log live during a run:

```sh
tail -f logs/20260501-085707/aarhus.log
```

## What you'll see while it runs

```sh
▶ 87 projects × 1 commands  (parallel=3, retries=5)
  logs: logs/20260501-085707/

[1/87] ✓ aarhus (4s)
[2/87] ✗ aalborg (12s — see logs/20260501-085707/aalborg.log)
[3/87] ✓ silkeborg (3s)
...
```

One line per project as it finishes — `✓` for success, `✗` for failure with a
pointer to the log.

## When things fail

After the run, failed projects get listed with the failing command and the
path to their log. The failed project names are also written to
`logs/<timestamp>/failed.txt`, so re-running the failures is one command:

```sh
failed projects:
  ✗ aarhus
      cmd: lagoon ssh -p aarhus -e main --command "drush status"
      log: logs/20260501-085707/aarhus.log

re-run only failed:
  ./run-on-projects.sh -p logs/20260501-085707/failed.txt -c commands.txt -j 3
```

## Why parallelism is bounded

Lagoon doesn't handle a flood of concurrent SSH sessions well, so the default
is `-j 3`. Crank it up cautiously; if you see SSH or auth errors in the logs,
lower it again.
