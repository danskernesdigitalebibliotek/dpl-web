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

Blank lines and lines starting with # are ignored in both files.
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

# Colours, only when stdout is a terminal.
if [[ -t 1 && "${TERM:-}" != "dumb" ]]; then
  C_GREEN=$'\033[32m'; C_RED=$'\033[31m'; C_YELLOW=$'\033[33m'
  C_CYAN=$'\033[36m';  C_DIM=$'\033[2m';  C_BOLD=$'\033[1m'
  C_RESET=$'\033[0m'
else
  C_GREEN=""; C_RED=""; C_YELLOW=""; C_CYAN=""
  C_DIM="";   C_BOLD="";  C_RESET=""
fi

# Read non-blank, non-comment lines into a newline-separated string.
read_lines() {
  local file="$1"
  [[ -f "$file" ]] || { echo "${C_RED}error: file not found: $file${C_RESET}" >&2; exit 2; }
  awk 'NF && $1 !~ /^#/' "$file"
}

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
mkdir -p "$STATE_DIR/seq"
trap 'rm -rf "$STATE_DIR"' EXIT

# Atomic sequence: returns the next 1-based index, race-free across workers.
# Uses mkdir which is atomic on POSIX filesystems.
next_index() {
  local i
  i=$(ls -1 "$STATE_DIR/seq" 2>/dev/null | wc -l | tr -d ' ')
  while true; do
    i=$((i + 1))
    if mkdir "$STATE_DIR/seq/$i" 2>/dev/null; then
      echo "$i"
      return
    fi
  done
}

printf '%s▶ %d projects × %d commands  %s(parallel=%d, retries=%d)%s\n' \
  "$C_BOLD" "$PROJECT_COUNT" "$COMMAND_COUNT" "$C_DIM" "$PARALLEL" "$RETRIES" "$C_RESET"
printf '%s  logs: %s/%s\n\n' "$C_DIM" "$LOG_DIR" "$C_RESET"

# Run a single command with retries. Streams to the project log file.
run_command() {
  local project="$1" cmd="$2" log="$3"
  local attempt rc=1
  for ((attempt=1; attempt<=RETRIES; attempt++)); do
    {
      printf '\n$ (attempt %d/%d) %s\n' "$attempt" "$RETRIES" "$cmd"
    } >> "$log"
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
  local log="$LOG_DIR/${project}.log"
  local started finished elapsed cmd rendered
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
      printf '%s\t%s\t%d\n' "fail" "$rendered" "$elapsed" > "$STATE_DIR/$project"
      return 1
    fi
  done <<< "$COMMANDS"

  finished=$(date +%s)
  elapsed=$((finished - started))
  printf '%s\t\t%d\n' "ok" "$elapsed" > "$STATE_DIR/$project"
  return 0
}

# Worker invoked through xargs. Prints a one-line status when finished.
worker() {
  local project="$1"
  local ok=0
  run_project "$project" && ok=1
  local idx elapsed
  idx=$(next_index)
  elapsed=$(awk -F'\t' '{print $3}' "$STATE_DIR/$project")
  if (( ok )); then
    printf '%s[%d/%d]%s %s✓%s %s %s(%ss)%s\n' \
      "$C_DIM" "$idx" "$PROJECT_COUNT" "$C_RESET" \
      "$C_GREEN" "$C_RESET" "$project" \
      "$C_DIM" "$elapsed" "$C_RESET"
  else
    printf '%s[%d/%d]%s %s✗%s %s %s(%ss — see %s/%s.log)%s\n' \
      "$C_DIM" "$idx" "$PROJECT_COUNT" "$C_RESET" \
      "$C_RED" "$C_RESET" "$project" \
      "$C_DIM" "$elapsed" "$LOG_DIR" "$project" "$C_RESET"
  fi
}
export -f worker run_project run_command next_index
export PROJECT_COUNT PARALLEL RETRIES RETRY_DELAY LOG_DIR STATE_DIR COMMANDS
export C_GREEN C_RED C_YELLOW C_CYAN C_DIM C_BOLD C_RESET

START_TIME=$(date +%s)

# xargs gives us bounded parallelism that survives Ctrl-C cleanly.
printf '%s\n' "$PROJECTS" | xargs -n 1 -P "$PARALLEL" -I {} bash -c 'worker "$@"' _ {}

END_TIME=$(date +%s)
TOTAL_ELAPSED=$((END_TIME - START_TIME))

# Summary.
OK_COUNT=0
FAIL_COUNT=0
FAILED_PROJECTS=()
while IFS= read -r project; do
  if [[ -f "$STATE_DIR/$project" ]]; then
    status=$(awk -F'\t' '{print $1}' "$STATE_DIR/$project")
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
    failed_cmd=$(awk -F'\t' '{print $2}' "$STATE_DIR/$project")
    printf '  ✗ %s\n' "$project"
    printf '%s      cmd: %s%s\n' "$C_DIM" "$failed_cmd" "$C_RESET"
    printf '%s      log: %s/%s.log%s\n' "$C_DIM" "$LOG_DIR" "$project" "$C_RESET"
  done
  printf '\n%sre-run only failed:%s\n' "$C_YELLOW" "$C_RESET"
  printf "  printf '%%s\\\\n' %s > failed.txt && \\\\\n" "${FAILED_PROJECTS[*]}"
  printf '  %s -p failed.txt -c %s -j %d\n' "$0" "$COMMANDS_FILE" "$PARALLEL"
fi

printf '\n%sper-project output saved to %s/%s\n' "$C_DIM" "$LOG_DIR" "$C_RESET"
printf '%s  e.g.  cat %s/<project>.log%s\n' "$C_DIM" "$LOG_DIR" "$C_RESET"
printf '%s        less %s/*.log%s\n' "$C_DIM" "$LOG_DIR" "$C_RESET"

(( FAIL_COUNT == 0 )) || exit 1
