#!/usr/bin/env bash
# Claude Code status line: one segment per watched Lagoon deployment.
# Running ones show a progress bar against the estimate (when there is one);
# finished ones linger for 15 minutes, then their state file is removed.
# A running entry not refreshed for 3 minutes is marked stale (watcher stopped).

# shellcheck source-path=SCRIPTDIR source=lib.sh
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

cat >/dev/null  # Claude Code sends session JSON on stdin; unused.
now=$(date +%s)
width=12

# bar <elapsed seconds> <estimate seconds>
bar() {
  local filled=$(($1 * width / $2)) b="" i
  [ "$filled" -gt "$width" ] && filled=$width
  for ((i = 0; i < width; i++)); do
    if [ "$i" -lt "$filled" ]; then b+="█"; else b+="░"; fi
  done
  echo "$b"
}

out=()
for f in "$state_dir"/*; do
  [ -f "$f" ] || continue
  IFS='|' read -r env status step started estimate updated <"$f"
  age=$((now - ${updated:-0}))
  case $status in
    complete|failed|cancelled|error)
      [ "$age" -lt 900 ] || { rm -f "$f"; continue; }
      if [ "$status" = complete ]; then out+=("✅ $env deployed"); else out+=("❌ $env $status"); fi ;;
    *)
      [ "$age" -le 10800 ] || { rm -f "$f"; continue; }
      stale=""
      [ "$age" -gt 180 ] && stale=" (stale)"
      if [ -z "$started" ]; then
        out+=("⏳ $env $status · $step$stale")
      elif [ -z "$estimate" ]; then
        out+=("⏳ $env $step $(progress $((now - started))) (no estimate)$stale")
      else
        out+=("⏳ $env $step $(bar $((now - started)) "$estimate") $(progress $((now - started)))$stale")
      fi ;;
  esac
done
sep=""
for s in "${out[@]}"; do printf '%s%s' "$sep" "$s"; sep="  │  "; done
echo
