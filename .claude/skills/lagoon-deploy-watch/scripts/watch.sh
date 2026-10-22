#!/usr/bin/env bash
# Watch a Lagoon deployment until it finishes.
#
# Prints one line per state change (status or build step) and exits when the
# deployment reaches a terminal state: 0 on complete, 1 on failed/cancelled/error.
# Mirrors the latest line to $XDG_CACHE_HOME/lagoon-deploy-watch/<project>__<env> for
# the status line (see statusline.sh).
#
# Usage: watch.sh [-p project] [-e environment] [-d deployment-name] [-i seconds]
# Defaults: environment from the current branch (pr-<N> if it has a PR, else the
# branch name), project from the Lagoon projects whose git URL matches origin,
# deployment = the one built for HEAD (see below; needs an authenticated gh).

set -u
interval=30 project="" env="" deployment=""
while getopts p:e:d:i: o; do
  case $o in
    p) project=$OPTARG ;; e) env=$OPTARG ;; d) deployment=$OPTARG ;; i) interval=$OPTARG ;;
    *) echo "usage: $0 [-p project] [-e env] [-d deployment] [-i seconds]" >&2; exit 2 ;;
  esac
done

die() { echo "ERROR: $*"; exit 2; }

# Prerequisites: fail with what to fix rather than misbehave later (an
# unauthenticated gh would otherwise silently fall back to the newest build).
missing=""
for c in git jq gh lagoon; do command -v "$c" >/dev/null || missing="$missing $c"; done
[ -z "$missing" ] || die "missing command(s):$missing; install them first"
gh auth status >/dev/null 2>&1 || die "gh is not logged in; run: gh auth login"
lagoon whoami >/dev/null 2>&1 || die "lagoon CLI can't authenticate; run: lagoon login (and check lagoon config)"
# Lagoon timestamps are UTC "YYYY-MM-DD HH:MM:SS". BSD date (macOS) parses with
# -j -f; GNU/BusyBox date (Linux) with -d.
if date -j -f %s 0 +%s >/dev/null 2>&1; then
  epoch() { date -j -u -f '%Y-%m-%d %H:%M:%S' "$1" +%s 2>/dev/null; }
else
  epoch() { date -u -d "$1" +%s 2>/dev/null; }
fi
# A missing environment comes back as {"data":[{}]}; drop such empty entries.
# --wide adds .created (when Lagoon queued the build).
deployments() { lagoon list deployments -p "$project" -e "$env" --wide --output-json 2>/dev/null | jq -c '(.data // empty) | map(select(.name != null))'; }

if [ -z "$env" ]; then
  branch=$(git branch --show-current) || die "not in a git repository"
  [ -n "$branch" ] || die "detached HEAD; pass -e"
  pr=$(gh pr view "$branch" --json number --jq .number 2>/dev/null)
  if [ -n "$pr" ]; then env="pr-$pr"; else env=${branch//\//-}; fi
fi

if [ -z "$project" ]; then
  repo=$(git remote get-url origin 2>/dev/null | sed -E 's#^.*[:/]([^/]+/[^/]+)$#\1#; s#\.git$##')
  [ -n "$repo" ] || die "no origin remote; pass -p"
  candidates=$(lagoon list projects --output-json 2>/dev/null |
    jq -r --arg r "$repo" '.data[] | select(.giturl | test("[:/]" + $r + "(\\.git)?$"; "i")) | .projectname')
  for c in $candidates; do
    project=$c
    deployments | jq -e 'length > 0' >/dev/null && break
    project=""
  done
  # A new PR's environment doesn't exist until its first build is queued; fall
  # back to the only matching project, or the one named after the repo, and wait below.
  if [ -z "$project" ]; then
    if [ "$(wc -w <<<"$candidates")" -eq 1 ]; then project=$candidates
    else project=$(grep -Fx "${repo##*/}" <<<"$candidates"); fi
  fi
  [ -n "$project" ] || die "no Lagoon project for $repo has environment $env; pass -p/-e"
fi

state_dir=${XDG_CACHE_HOME:-$HOME/.cache}/lagoon-deploy-watch
mkdir -p "$state_dir"
state_file="$state_dir/${project}__${env}"

# Lagoon doesn't record which commit a deployment builds. In dpl-web, builds are
# started by the "Lagoon / Deploy application" workflow
# (.github/workflows/lagoon-deploy.yml): once the Go base image is built, its
# deploy job sends Lagoon the event and Lagoon creates the deployment within
# seconds. So HEAD's build is the first deployment created after that job of
# HEAD's workflow run started. Without such a run (manual deploys, docs-only
# pushes, a renamed job), fall back to the newest deployment.
workflow=lagoon-deploy.yml deploy_job="Lagoon / Send deploy event to Lagoon"
head_sha=$(git rev-parse HEAD 2>/dev/null) short=$(git rev-parse --short HEAD 2>/dev/null)
# pr-<N> environments are deployed by pull_request runs, branches by push runs.
case $env in pr-*) event=pull_request ;; *) event=push ;; esac

# HEAD's workflow run as "<state>|<detail>": sent|<epoch the deploy job started>,
# running|<job in progress>, failed|<why>, or none| (no run, or no deploy job).
run_state() {
  local id
  id=$(gh run list --workflow "$workflow" --commit "$head_sha" --event "$event" --limit 1 \
    --json databaseId --jq '.[0].databaseId // empty' 2>/dev/null)
  [ -n "$id" ] || { echo "none|"; return; }
  gh run view "$id" --json status,conclusion,url,jobs 2>/dev/null | jq -r --arg j "$deploy_job" '
    ([.jobs[] | select(.name == $j)][0]) as $d
    | if $d == null then (if .status == "completed" then "none|" else "running|queued" end)
      elif $d.conclusion == "success" or $d.status == "in_progress" then "sent|\($d.startedAt | fromdateiso8601)"
      elif $d.status == "completed" then "failed|deploy job \($d.conclusion), \(.url)"
      else "running|\([.jobs[] | select(.status == "in_progress") | .name][0] // "queued")" end' ||
    echo "none|"
}

# Find HEAD's deployment. Waits as long as HEAD's workflow run is still working
# towards the deploy job, otherwise up to 20 minutes.
if [ -z "$deployment" ]; then
  waited=0 shown=""
  while :; do
    IFS='|' read -r state detail <<<"$(run_state)"
    case $state in
      sent)
        # 5s of slack for clock skew between GitHub and Lagoon.
        deployment=$(deployments | jq -r --argjson t "$detail" '
          [.[] | select(.created != null and (.created | strptime("%Y-%m-%d %H:%M:%S") | mktime) >= $t - 5)]
          | sort_by(.created) | .[0].name // empty')
        [ -n "$deployment" ] && break
        detail="Lagoon to queue the build" ;;
      failed)
        rm -f "$state_file"
        die "$workflow run for $short ended without deploying ($detail)" ;;
      none)
        # Give GitHub a few minutes to create the run before falling back.
        if [ "$waited" -ge 180 ]; then
          deployment=$(deployments | jq -r '.[0].name // empty')
          if [ -n "$deployment" ]; then
            echo "$project/$env: no $workflow run for $short; watching the newest deployment, which may be another commit's"
            break
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
    printf '%s|waiting|%s|||\n' "$env" "$detail" >"$state_file"
    [ "$state" = running ] || waited=$((waited + interval))
    if [ "$waited" -gt 1200 ]; then
      rm -f "$state_file"
      die "no deployment of $short appeared within 20 min; pass -d to watch an existing one"
    fi
    sleep "$interval"
  done
fi

# Estimate the duration as the average of the last 5 successful deploys of this
# environment, falling back to the project's production environment. Without
# either, there is no estimate (and no progress bar).
avg_duration() {
  jq -r --arg n "$deployment" \
    '[.[] | select(.status == "complete" and .name != $n)][:5][] | "\(.started)\t\(.completed)"' |
    while IFS=$'\t' read -r s c; do
      a=$(epoch "$s") b=$(epoch "$c")
      [ -n "$a" ] && [ -n "$b" ] && echo $((b - a))
    done |
    awk '{ t += $1; n++ } END { if (n) printf "%d %d\n", t / n, n }'
}
read -r estimate samples <<<"$(deployments | avg_duration)"
basis=$env
if [ -z "${estimate:-}" ]; then
  basis=$(lagoon get project -p "$project" --output-json 2>/dev/null | jq -r '.data[0].productionenvironment // empty')
  if [ -n "$basis" ] && [ "$basis" != "$env" ]; then
    read -r estimate samples <<<"$(env=$basis deployments | avg_duration)"
  fi
fi
if [ -n "${estimate:-}" ]; then
  echo "$project/$env: watching $deployment, estimate ~$(((estimate + 30) / 60))m (average of $samples previous deploys of $basis)"
else
  estimate=""
  echo "$project/$env: watching $deployment, no previous successful deploys to estimate from"
fi

# "8m/~11m" while within the estimate, "13m/~11m (+2m)" past it, "8m" without one.
progress() {
  local el=$(($1 / 60))
  [ -z "$estimate" ] && { echo "${el}m"; return; }
  local est=$(((estimate + 30) / 60))
  if [ "$1" -le "$estimate" ]; then echo "${el}m/~${est}m"
  elif [ "$el" -gt "$est" ]; then echo "${el}m/~${est}m (+$((el - est))m)"
  else echo "${el}m/~${est}m (over)"; fi
}

prev=""
while :; do
  d=$(deployments | jq -c --arg n "$deployment" '.[] | select(.name == $n)')
  if [ -z "$d" ]; then sleep "$interval"; continue; fi  # transient API failure
  status=$(jq -r .status <<<"$d")
  step=$(jq -r .buildstep <<<"$d")
  id=$(jq -r .id <<<"$d")
  started=$(epoch "$(jq -r .started <<<"$d")")
  # A finished build's duration ends at its completion, not now.
  ended=$(epoch "$(jq -r .completed <<<"$d")") || ended=""
  elapsed=""
  [ -n "$started" ] && elapsed=" $(progress $((${ended:-$(date +%s)} - started)))"
  # The status line computes elapsed time itself; it needs the start epoch.
  # Pipe-separated: read's IFS would merge empty tab-separated fields.
  printf '%s|%s|%s|%s|%s|%s\n' "$env" "$status" "$step" "${started:-}" "$id" "$estimate" >"$state_file"
  cur="$status · $step"
  if [ "$cur" != "$prev" ]; then
    echo "$project/$env #$id $cur$elapsed"
    prev=$cur
  fi
  case $status in
    complete) exit 0 ;;
    failed|cancelled|error)
      echo "Logs: lagoon get deployment -p $project -e $env -N $deployment --logs"
      exit 1 ;;
  esac
  sleep "$interval"
done
