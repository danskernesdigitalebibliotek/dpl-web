#!/usr/bin/env bash
# Claude Code status line: one segment per watched Lagoon deployment.
# Running ones show a progress bar against the estimate (when there is one);
# finished ones linger for 15 minutes.
# A running entry not refreshed for 3 minutes is marked stale (watcher stopped).

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
for f in "${XDG_CACHE_HOME:-$HOME/.cache}"/lagoon-deploy-watch/*; do
  [ -f "$f" ] || continue
  # GNU stat (Linux) first: there `stat -f` means filesystem status, not format.
  age=$((now - $(stat -c %Y "$f" 2>/dev/null || stat -f %m "$f")))
  IFS='|' read -r env status step started _ estimate <"$f"
  case $status in
    complete) [ "$age" -lt 900 ] && out+=("✅ $env deployed") ;;
    failed|cancelled|error) [ "$age" -lt 900 ] && out+=("❌ $env $status") ;;
    *)
      [ "$age" -gt 10800 ] && continue
      stale=""
      [ "$age" -gt 180 ] && stale=" (stale)"
      if [ -z "$started" ]; then
        out+=("⏳ $env $status · $step$stale")
      elif [ -z "$estimate" ]; then
        out+=("⏳ $env $step $(((now - started) / 60))m (no estimate)$stale")
      else
        el=$((now - started)) el_m=$(((now - started) / 60)) est_m=$(((estimate + 30) / 60))
        if [ "$el" -le "$estimate" ]; then
          left=$((est_m - el_m)); [ "$left" -lt 1 ] && left=1
          left="~${left}m left"
        elif [ "$el_m" -gt "$est_m" ]; then
          left="+$((el_m - est_m))m over"
        else
          left="over estimate"
        fi
        out+=("⏳ $env $step $(bar "$el" "$estimate") ${el_m}m/~${est_m}m · $left$stale")
      fi ;;
  esac
done
sep=""
for s in "${out[@]}"; do printf '%s%s' "$sep" "$s"; sep="  │  "; done
echo
