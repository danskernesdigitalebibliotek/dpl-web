#!/usr/bin/env bash
# run-on-projects.sh — Run shell commands against many Lagoon projects in parallel.
#
# Reads a list of projects (one per line) and a list of commands (one per line,
# with {project} as placeholder) and runs them in parallel with retries and
# per-project log files.
#
# Quick start:
#   ./run-on-projects.sh                    # uses projects.txt + commands.txt, -j 3
#   ./run-on-projects.sh -j 5               # 5 projects in parallel
#   ./run-on-projects.sh -p mine.txt -c cron.txt
#   ./run-on-projects.sh --dry-run

set -uo pipefail

# Colours, only when stdout is a terminal.
if [[ -t 1 && "${TERM:-}" != "dumb" ]]; then
  C_GREEN=$'\033[32m'; C_RED=$'\033[31m'; C_YELLOW=$'\033[33m'
  C_CYAN=$'\033[36m';  C_DIM=$'\033[2m';  C_BOLD=$'\033[1m'
  C_RESET=$'\033[0m'
else
  C_GREEN=""; C_RED=""; C_YELLOW=""; C_CYAN=""
  C_DIM="";   C_BOLD="";  C_RESET=""
fi

# Strip blank/comment lines and trailing inline comments.
# An inline `#` is treated as a comment only when preceded by whitespace, so
# `#` inside a quoted command (e.g. drush --filter="status#ok") is preserved.
read_lines() {
  local file="$1"
  [[ -f "$file" ]] || { echo "${C_RED}error: file not found: $file${C_RESET}" >&2; exit 2; }
  awk '
    {
      sub(/[[:space:]]+#.*$/, "")   # drop trailing inline comment
      sub(/^[[:space:]]+/, "")      # trim leading whitespace
      sub(/[[:space:]]+$/, "")      # trim trailing whitespace
    }
    /^#/ { next }                   # skip full-line comments
    NF                              # skip blank lines
  ' "$file"
}

# Sanitise a project name for safe use as a filename.
sanitise() { printf '%s' "${1//\//-}"; }

# Run a single command with retries. Streams to the project log file.
run_command() {
  local project="$1" cmd="$2" log="$3"
  local attempt rc=1
  for ((attempt=1; attempt<=RETRIES; attempt++)); do
    printf '\n$ (attempt %d/%d) %s\n' "$attempt" "$RETRIES" "$cmd" >> "$log"
    if bash -c "$cmd" >> "$log" 2>&1; then
      return 0
    fi
    rc=$?
    if (( attempt < RETRIES )); then
      printf '[exit %d, retrying in %ss]\n' "$rc" "$RETRY_DELAY" >> "$log"
      sleep "$RETRY_DELAY"
    fi
  done
  printf '[gave up after %d attempts, exit %d]\n' "$RETRIES" "$rc" >> "$log"
  return 1
}

# Run all commands for one project, in order. Stop on first failure.
run_project() {
  local project="$1"
  local safe log started finished elapsed cmd rendered
  safe=$(sanitise "$project")
  log="$LOG_DIR/${safe}.log"
  started=$(date +%s)
  {
    printf '# project: %s\n' "$project"
    printf '# started: %s\n' "$(date -Iseconds 2>/dev/null || date)"
  } > "$log"

  while IFS= read -r cmd; do
    rendered="${cmd//\{project\}/$project}"
    if ! run_command "$project" "$rendered" "$log"; then
      finished=$(date +%s)
      elapsed=$((finished - started))
      printf '%s\t%s\t%d\n' "fail" "$rendered" "$elapsed" > "$STATE_DIR/results/$safe"
      return 1
    fi
  done < "$STATE_DIR/commands"

  finished=$(date +%s)
  elapsed=$((finished - started))
  printf '%s\t\t%d\n' "ok" "$elapsed" > "$STATE_DIR/results/$safe"
  return 0
}

# Atomic counter via mkdir. Linear search from 1 — bounded by the number of
# completed workers, so total work is O(N²) at worst. Fine for the scales
# we run at; if you need higher concurrency, drop the [N/M] index entirely.
next_index() {
  local i=1
  while ! mkdir "$STATE_DIR/seq/$i" 2>/dev/null; do
    i=$((i + 1))
  done
  printf '%d' "$i"
}

# Worker invoked through xargs. Prints a one-line status when finished.
worker() {
  local project="$1"
  local safe ok=0 idx elapsed
  safe=$(sanitise "$project")
  run_project "$project" && ok=1
  idx=$(next_index)
  elapsed=$(awk -F'\t' '{print $3}' "$STATE_DIR/results/$safe")
  if (( ok )); then
    printf '%s[%d/%d]%s %s✓%s %s %s(%ss)%s\n' \
      "$C_DIM" "$idx" "$PROJECT_COUNT" "$C_RESET" \
      "$C_GREEN" "$C_RESET" "$project" \
      "$C_DIM" "$elapsed" "$C_RESET"
  else
    printf '%s[%d/%d]%s %s✗%s %s %s(%ss — see %s/%s.log)%s\n' \
      "$C_DIM" "$idx" "$PROJECT_COUNT" "$C_RESET" \
      "$C_RED" "$C_RESET" "$project" \
      "$C_DIM" "$elapsed" "$LOG_DIR" "$safe" "$C_RESET"
  fi
}

# Worker mode: invoked as `bash "$0" --worker <project>` from xargs. All
# state is read from env vars and from $STATE_DIR (set by the parent).
# This avoids `export -f`, which is unreliable under macOS SIP because the
# system /usr/bin/xargs scrubs BASH_FUNC_* env vars before invoking bash.
if [[ "${1:-}" == "--worker" ]]; then
  worker "$2"
  exit
fi

# ----- parent mode -----

PROJECTS_FILE="projects.txt"
COMMANDS_FILE="commands.txt"
PARALLEL=3
RETRIES=5
RETRY_DELAY=1
LOG_DIR=""
DRY_RUN=0

usage() {
  cat <<EOF
Usage: $0 [options]

  -p, --projects FILE     Project list, one per line (default: projects.txt)
  -c, --commands FILE     Command list, one per line, {project} is replaced
                          (default: commands.txt)
  -j, --parallel N        Projects to run in parallel (default: 3)
  -r, --retries N         Retries per command on non-zero exit (default: 5)
  -d, --retry-delay SEC   Seconds between retries (default: 1)
      --log-dir DIR       Where to write per-project logs
                          (default: ./logs/<timestamp>)
      --dry-run           Print resolved commands and exit
  -h, --help              Show this help

Blank lines, full-line comments (# ...) and trailing inline comments are
ignored in both files.
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    -p|--projects)    PROJECTS_FILE="$2"; shift 2 ;;
    -c|--commands)    COMMANDS_FILE="$2"; shift 2 ;;
    -j|--parallel)    PARALLEL="$2"; shift 2 ;;
    -r|--retries)     RETRIES="$2"; shift 2 ;;
    -d|--retry-delay) RETRY_DELAY="$2"; shift 2 ;;
    --log-dir)        LOG_DIR="$2"; shift 2 ;;
    --dry-run)        DRY_RUN=1; shift ;;
    -h|--help)        usage; exit 0 ;;
    *) echo "unknown argument: $1" >&2; usage >&2; exit 2 ;;
  esac
done

PROJECTS=$(read_lines "$PROJECTS_FILE")
COMMANDS=$(read_lines "$COMMANDS_FILE")

[[ -n "$PROJECTS" ]] || { echo "${C_RED}error: $PROJECTS_FILE is empty${C_RESET}" >&2; exit 2; }
[[ -n "$COMMANDS" ]] || { echo "${C_RED}error: $COMMANDS_FILE is empty${C_RESET}" >&2; exit 2; }

PROJECT_COUNT=$(printf '%s\n' "$PROJECTS" | wc -l | tr -d ' ')
COMMAND_COUNT=$(printf '%s\n' "$COMMANDS" | wc -l | tr -d ' ')

if (( DRY_RUN )); then
  printf '%sDRY RUN — %d projects × %d commands (parallel=%d)%s\n' \
    "$C_BOLD" "$PROJECT_COUNT" "$COMMAND_COUNT" "$PARALLEL" "$C_RESET"
  i=0
  while IFS= read -r project; do
    (( i++ < 3 )) || { printf '%s  … plus %d more projects%s\n' \
      "$C_DIM" $((PROJECT_COUNT - 3)) "$C_RESET"; break; }
    printf '\n%s  [%s]%s\n' "$C_CYAN" "$project" "$C_RESET"
    while IFS= read -r cmd; do
      printf '    $ %s\n' "${cmd//\{project\}/$project}"
    done <<< "$COMMANDS"
  done <<< "$PROJECTS"
  exit 0
fi

if [[ -z "$LOG_DIR" ]]; then
  LOG_DIR="logs/$(date +%Y%m%d-%H%M%S)"
fi
mkdir -p "$LOG_DIR"

STATE_DIR=$(mktemp -d)
mkdir -p "$STATE_DIR/seq" "$STATE_DIR/results"
# Stash the cleaned commands so workers can read them straight from disk
# instead of inheriting them through the env (avoids ARG_MAX worries).
printf '%s\n' "$COMMANDS" > "$STATE_DIR/commands"
trap 'rm -rf "$STATE_DIR"' EXIT

printf '%s▶ %d projects × %d commands  %s(parallel=%d, retries=%d)%s\n' \
  "$C_BOLD" "$PROJECT_COUNT" "$COMMAND_COUNT" "$C_DIM" "$PARALLEL" "$RETRIES" "$C_RESET"
printf '%s  logs: %s/%s\n\n' "$C_DIM" "$LOG_DIR" "$C_RESET"

# Variables (not functions) — these survive macOS SIP env scrubbing because
# they don't carry the BASH_FUNC_*%% prefix that SIP filters on.
export PROJECT_COUNT PARALLEL RETRIES RETRY_DELAY LOG_DIR STATE_DIR
export C_GREEN C_RED C_YELLOW C_CYAN C_DIM C_BOLD C_RESET

START_TIME=$(date +%s)

# xargs gives us bounded parallelism that survives Ctrl-C cleanly.
# - Self-invoking via `bash "$0" --worker {}` so we don't rely on `export -f`
#   (macOS SIP scrubs BASH_FUNC_*%% env vars when invoking /usr/bin/xargs).
# - NUL-delimited (`xargs -0`) so project names are passed through literally,
#   without xargs's default shell-style quote handling.
printf '%s\n' "$PROJECTS" | tr '\n' '\0' | \
  xargs -0 -n 1 -P "$PARALLEL" -I {} bash "$0" --worker {}

END_TIME=$(date +%s)
TOTAL_ELAPSED=$((END_TIME - START_TIME))

# Summary.
OK_COUNT=0
FAIL_COUNT=0
FAILED_PROJECTS=()
while IFS= read -r project; do
  safe=$(sanitise "$project")
  if [[ -f "$STATE_DIR/results/$safe" ]]; then
    status=$(awk -F'\t' '{print $1}' "$STATE_DIR/results/$safe")
    if [[ "$status" == "ok" ]]; then
      OK_COUNT=$((OK_COUNT + 1))
    else
      FAIL_COUNT=$((FAIL_COUNT + 1))
      FAILED_PROJECTS+=("$project")
    fi
  fi
done <<< "$PROJECTS"

printf '\n%s%s%s\n' "$C_DIM" "────────────────────────────────────────────────────────────" "$C_RESET"
printf '%sdone%s  %s✓ %d ok%s  %s✗ %d failed%s  in %ss\n' \
  "$C_BOLD" "$C_RESET" \
  "$C_GREEN" "$OK_COUNT" "$C_RESET" \
  "$C_RED" "$FAIL_COUNT" "$C_RESET" \
  "$TOTAL_ELAPSED"

if (( FAIL_COUNT > 0 )); then
  printf '\n%sfailed projects:%s\n' "$C_RED" "$C_RESET"
  for project in "${FAILED_PROJECTS[@]}"; do
    safe=$(sanitise "$project")
    failed_cmd=$(awk -F'\t' '{print $2}' "$STATE_DIR/results/$safe")
    printf '  ✗ %s\n' "$project"
    printf '%s      cmd: %s%s\n' "$C_DIM" "$failed_cmd" "$C_RESET"
    printf '%s      log: %s/%s.log%s\n' "$C_DIM" "$LOG_DIR" "$safe" "$C_RESET"
  done
  # Write the failed list to a file directly so we don't have to construct
  # a shell snippet that quotes project names containing spaces correctly.
  failed_file="$LOG_DIR/failed.txt"
  printf '%s\n' "${FAILED_PROJECTS[@]}" > "$failed_file"
  printf '\n%sre-run only failed:%s\n' "$C_YELLOW" "$C_RESET"
  printf '  %s -p %s -c %s -j %d\n' "$0" "$failed_file" "$COMMANDS_FILE" "$PARALLEL"
fi

printf '\n%sper-project output saved to %s/%s\n' "$C_DIM" "$LOG_DIR" "$C_RESET"
printf '%s  e.g.  cat %s/<project>.log%s\n' "$C_DIM" "$LOG_DIR" "$C_RESET"
printf '%s        less %s/*.log%s\n' "$C_DIM" "$LOG_DIR" "$C_RESET"

(( FAIL_COUNT == 0 )) || exit 1
