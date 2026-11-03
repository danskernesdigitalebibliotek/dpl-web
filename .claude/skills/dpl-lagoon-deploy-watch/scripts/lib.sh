# shellcheck shell=bash
# Globals are shared with the sourcing script (see below), which shellcheck
# can't see when checking this file on its own.
# shellcheck disable=SC2034,SC2154
# Helpers for watch.sh and statusline.sh. Source it; don't run it.
#
# Functions that resolve something set the global named after it (env,
# project, deployment; estimate_duration sets estimate, samples and basis)
# instead of echoing it, so their die() reaches the output rather than a
# command substitution. They read watch.sh's settings from globals too:
# interval, state_file, workflow and deploy_job.

state_dir=${XDG_CACHE_HOME:-$HOME/.cache}/dpl-lagoon-deploy-watch

die() { echo "ERROR: $*"; exit 2; }

# Seconds rounded to whole minutes.
round_minutes() { echo $((($1 + 30) / 60)); }

# The state file, one per watched environment, read by statusline.sh.
# Pipe-separated: read's IFS would merge empty tab-separated fields. The last
# field is the write time, which tells the status line the watcher is alive.
# write_state <env> <status> <step> <started epoch> <estimate seconds>
write_state() { printf '%s|%s|%s|%s|%s|%s\n' "$@" "$(date +%s)" >"$state_file"; }

# Like die, but also drops the state file so the status line doesn't keep
# showing a wait that has ended.
abort() { rm -f "$state_file"; die "$@"; }

# Prepended to jq programs. Lagoon timestamps are UTC "YYYY-MM-DD HH:MM:SS",
# which mktime reads as UTC; anything else (null, "") becomes null.
jq_defs='def epoch: try (strptime("%Y-%m-%d %H:%M:%S") | mktime) catch null;'

# Fail with what to fix rather than misbehave later (an unauthenticated gh
# would otherwise silently fall back to the newest build).
check_prerequisites() {
  local c missing=""
  for c in git jq gh lagoon; do command -v "$c" >/dev/null || missing+=" $c"; done
  [ -z "$missing" ] || die "missing command(s):$missing; install them first"
  gh auth status >/dev/null 2>&1 || die "gh is not logged in; run: gh auth login"
  lagoon whoami >/dev/null 2>&1 || die "lagoon CLI can't authenticate; run: lagoon login (and check lagoon config)"
}

# deployments <project> <env>: JSON array, newest first. A missing environment
# comes back as {"data":[{}]}; drop such empty entries. --wide adds .created
# (when Lagoon queued the build).
deployments() {
  lagoon list deployments -p "$1" -e "$2" --wide --output-json 2>/dev/null |
    jq -c '(.data // empty) | map(select(.name != null))'
}

# Sets env: pr-<N> if the current branch has a PR, else the branch name.
# Mirrors LAGOON_ENVIRONMENT in .github/workflows/lagoon-deploy.yml.
resolve_env() {
  local branch pr
  branch=$(git branch --show-current) || die "not in a git repository"
  [ -n "$branch" ] || die "detached HEAD; pass -e"
  pr=$(gh pr view "$branch" --json number --jq .number 2>/dev/null)
  if [ -n "$pr" ]; then env="pr-$pr"; else env=${branch//\//-}; fi
}

# Sets project to the Lagoon project whose git URL matches origin and that has
# $env. A new PR's environment doesn't exist until its first build is queued;
# then fall back to the only matching project, or the one named after the repo.
resolve_project() {
  local repo candidates c
  repo=$(git remote get-url origin 2>/dev/null | sed -E 's#^.*[:/]([^/]+/[^/]+)$#\1#; s#\.git$##')
  [ -n "$repo" ] || die "no origin remote; pass -p"
  candidates=$(lagoon list projects --output-json 2>/dev/null |
    jq -r --arg r "$repo" '.data[] | select(.giturl | test("[:/]" + $r + "(\\.git)?$"; "i")) | .projectname')
  for c in $candidates; do
    if deployments "$c" "$env" | jq -e 'length > 0' >/dev/null; then project=$c; return; fi
  done
  if [ "$(wc -w <<<"$candidates")" -eq 1 ]; then project=$candidates
  else project=$(grep -Fx "${repo##*/}" <<<"$candidates"); fi
  [ -n "$project" ] || die "no Lagoon project for $repo has environment $env; pass -p/-e"
}

# Lagoon doesn't record which commit a deployment builds. In dpl-web, builds are
# started by the $workflow workflow: once the Go base image is built, its
# $deploy_job job sends Lagoon the event and Lagoon creates the deployment
# within seconds. So HEAD's build is the first deployment created after that
# job of HEAD's workflow run started.
#
# Prints the run of $head_sha as "<state>|<detail>": sent|<epoch the deploy job
# started>, running|<job in progress>, failed|<why>, or none| (no run, or no
# deploy job).
run_state() {
  local id
  id=$(gh run list --workflow "$workflow" --commit "$head_sha" --event "$event" --limit 1 \
    --json databaseId --jq '.[0].databaseId // empty' 2>/dev/null)
  [ -n "$id" ] || { echo "none|"; return; }
  gh run view "$id" --json status,conclusion,url,jobs 2>/dev/null | jq -r --arg j "$deploy_job" '
    # The deploy job is only listed once the jobs it needs have finished.
    ([.jobs[] | select(.name == $j)][0]) as $d
    | ([.jobs[] | select(.status == "in_progress") | .name][0] // "queued") as $current
    | if $d == null then (if .status == "completed" then "none|" else "running|\($current)" end)
      elif $d.conclusion == "success" or $d.status == "in_progress" then "sent|\($d.startedAt | fromdateiso8601)"
      elif $d.status == "completed" then "failed|deploy job \($d.conclusion), \(.url)"
      else "running|\($current)" end' ||
    echo "none|"
}

# Sets deployment to HEAD's build (see run_state). Waits as long as HEAD's
# workflow run is still working towards the deploy job, otherwise up to 20
# minutes. Without such a run (manual deploys, docs-only pushes, a renamed
# job), falls back to the newest deployment after 3 minutes.
wait_for_deployment() {
  local waited=0 shown="" state detail head_sha short event
  head_sha=$(git rev-parse HEAD) short=$(git rev-parse --short HEAD)
  # pr-<N> environments are deployed by pull_request runs, branches by push runs.
  case $env in pr-*) event=pull_request ;; *) event=push ;; esac
  while :; do
    IFS='|' read -r state detail <<<"$(run_state)"
    case $state in
      sent)
        # 5s of slack for clock skew between GitHub and Lagoon.
        deployment=$(deployments "$project" "$env" | jq -r --argjson t "$detail" "$jq_defs"'
          [.[] | select((.created | epoch) >= $t - 5)] | sort_by(.created) | .[0].name // empty')
        [ -n "$deployment" ] && return
        detail="Lagoon to queue the build" ;;
      failed)
        abort "$workflow run for $short ended without deploying ($detail)" ;;
      none)
        # Give GitHub a few minutes to create the run before falling back.
        if [ "$waited" -ge 180 ]; then
          deployment=$(deployments "$project" "$env" | jq -r '.[0].name // empty')
          if [ -n "$deployment" ]; then
            echo "$project/$env: no $workflow run for $short; watching the newest deployment, which may be another commit's"
            return
          fi
        fi
        detail="its $workflow run" ;;
      running) detail="workflow job \"$detail\"" ;;
    esac
    if [ "$detail" != "$shown" ]; then
      echo "$project/$env: waiting for $short: $detail"
      shown=$detail
    fi
    # Show the wait in the status line too; rewritten each poll so it never looks stale.
    write_state "$env" waiting "$detail" "" ""
    [ "$state" = running ] || waited=$((waited + interval))
    [ "$waited" -le 1200 ] || abort "no deployment of $short appeared within 20 min; pass -d to watch an existing one"
    sleep "$interval"
  done
}

# estimate_from <env>: sets estimate and samples to the average duration and
# count of the last 5 successful deploys of <env> other than $deployment.
estimate_from() {
  read -r estimate samples <<<"$(deployments "$project" "$1" | jq -r --arg n "$deployment" "$jq_defs"'
    [.[] | select(.status == "complete" and .name != $n)][:5]
    | map((.started | epoch) as $s | (.completed | epoch) as $c | select($s and $c) | $c - $s)
    | if length > 0 then "\(add / length | floor) \(length)" else empty end')"
}

# Sets estimate (seconds) and samples from the last successful deploys of $env,
# falling back to the project's production environment, and basis to the
# environment used. Without either, estimate is empty (and there's no progress bar).
estimate_duration() {
  basis=$env
  estimate_from "$basis"
  [ -n "$estimate" ] && return
  basis=$(lagoon get project -p "$project" --output-json 2>/dev/null | jq -r '.data[0].productionenvironment // empty')
  if [ -n "$basis" ] && [ "$basis" != "$env" ]; then
    estimate_from "$basis"
  fi
}

# progress <elapsed seconds> [finished]: against $estimate, "8m/~11m · ~3m left"
# within it ("8m/~11m" once finished), "13m/~11m · +2m over" past it; "8m"
# without one.
progress() {
  local el=$(($1 / 60)) est
  [ -z "$estimate" ] && { echo "${el}m"; return; }
  est=$(round_minutes "$estimate")
  if [ "$1" -le "$estimate" ] && [ -n "${2:-}" ]; then echo "${el}m/~${est}m"
  elif [ "$1" -le "$estimate" ]; then echo "${el}m/~${est}m · ~$((est - el > 1 ? est - el : 1))m left"
  elif [ "$el" -gt "$est" ]; then echo "${el}m/~${est}m · +$((el - est))m over"
  else echo "${el}m/~${est}m · over estimate"; fi
}

# Polls $deployment, printing a line per change of status or build step and
# mirroring it to the state file. Returns 0 on complete, 1 on
# failed/cancelled/error.
watch_deployment() {
  local prev="" cur line status step id started ended elapsed
  while :; do
    line=$(deployments "$project" "$env" | jq -r --arg n "$deployment" "$jq_defs"'
      .[] | select(.name == $n)
      | [.status, .buildstep, .id, (.started | epoch), (.completed | epoch)]
      | map(. // "" | tostring) | join("|")')
    if [ -z "$line" ]; then sleep "$interval"; continue; fi  # transient API failure
    IFS='|' read -r status step id started ended <<<"$line"
    # The status line computes elapsed time itself; it needs the start epoch.
    write_state "$env" "$status" "$step" "$started" "$estimate"
    cur="$status · $step"
    if [ "$cur" != "$prev" ]; then
      # A finished build's duration ends at its completion, not now.
      elapsed=""
      if [ -n "$started" ] && [ -n "$ended" ]; then elapsed=" $(progress $((ended - started)) finished)"
      elif [ -n "$started" ]; then elapsed=" $(progress $(($(date +%s) - started)))"; fi
      echo "$project/$env #$id $cur$elapsed"
      prev=$cur
    fi
    case $status in
      complete) return 0 ;;
      failed|cancelled|error)
        echo "Logs: lagoon get deployment -p $project -e $env -N $deployment --logs"
        return 1 ;;
    esac
    sleep "$interval"
  done
}
