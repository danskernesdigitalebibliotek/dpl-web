# @danskernesdigitalebibliotek/dpl-dependabot-ignore-lint

Fails CI when an `ignore` rule in `.github/dependabot.yml` is already satisfied
by the version installed in a lockfile.

A rule like

```yaml
- dependency-name: some-package
  versions: [">=14.4.0"]
```

is written to hold a dependency back. Once someone upgrades to 15.x anyway, the
rule holds nothing back any more. It only suppresses every 15.x patch and minor
update, and unless it is scoped with `update-types`, security updates too.
Dependabot does not warn about this. This tool does, on the pull request that
made the rule obsolete, pointing at the line to delete.

## Findings

| kind          | meaning                                                         | fails |
| ------------- | --------------------------------------------------------------- | ----- |
| `stale`       | installed version satisfies the ignored `versions` range        | yes   |
| `partial`     | a wildcard rule is stale for some of its matches, not all       | yes   |
| `dead`        | `dependency-name` matches nothing in any directory of its block | yes   |
| `unparseable` | the range or installed version could not be read as semver      | no    |
| `skipped`     | directory has no supported lockfile                             | no    |

A `dead` rule can never apply to anything and should be deleted; until it is,
it waits to be inherited by whoever adds the package back. With
`directories: ["/packages/*"]` one block covers several packages, so a rule
that is right for one does not apply to another - that is normal and is not
reported. A rule is only called dead when every directory of its block was
read and none matched.

The failing kinds need different fixes. A `stale` rule holds nothing back
and should be deleted. A `partial` rule still holds its other matches back, so
deleting it unblocks them; it has to be split into one entry per package,
leaving out the package that made it stale. Dependabot cannot exclude a
package from a wildcard, so splitting is the only way to express that.

`update-types` rules ("no majors") cannot be stale in this sense and are not
checked.

## Ecosystems

| ecosystem  | lockfiles                                           | range syntax                               |
| ---------- | --------------------------------------------------- | ------------------------------------------ |
| `npm`      | `pnpm-lock.yaml` (v6+), `package-lock.json` (v2/v3) | node-semver, used as-is                    |
| `composer` | `composer.lock` (+ `composer.json` for direct deps) | Composer, translated (see `src/ranges.ts`) |

Workspaces are supported: the tool walks up from each directory to the nearest
lockfile and reads that directory's `importers` / `packages` entry.

## Layout

```
src/
  cli.ts            entry point; `node src/cli.ts <repo-root>` (Node strips the types)
  audit.ts          reads the config, resolves directories, reads lockfiles
  evaluate.ts       compares ignore entries with what is installed (no I/O)
  config.ts         reads dependabot.yml with line numbers (yaml document model)
  directories.ts    expands directory globs, finds the governing lockfile
  names.ts          dependency-name matching, as Dependabot does it
  ranges.ts         Composer -> node-semver translation, version normalisation
  report.ts         table output and GitHub annotations
  lockfiles/        one reader per lockfile format
  __fixtures__/     a miniature repository audit.test.ts resolves against
```

`audit.test.ts` covers resolution - finding a block's directories and reading
the lockfile governing each - against that fixture repository, which is why the
fixture holds one dependency per directory and nothing more. Everything the
audit concludes from those versions is tested in `evaluate.ts` from in-memory
inputs. The other unit tests likewise live in the file they cover, behind
`if (import.meta.vitest)` (vitest's `includeSource`), so a rule about Composer
constraints or `dependency-name` matching sits next to the code implementing
it. Node leaves those blocks alone: `import.meta.vitest` is undefined outside
vitest, so nothing runs and there is nothing to strip.
