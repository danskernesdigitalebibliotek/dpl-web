# Split Cypress specs across CI machines with cypress-split

## Context

Both the React and the CMS Cypress suites take too long to run on one CI
machine, so each runs on several.

- **React** relied on Cypress Cloud to hand specs to three machines as
  they became free. The project is on Cypress Cloud's free open-source
  plan, which includes parallelization up to a monthly quota of test
  results. We exceed that quota. Once it is used up, Cloud stops
  balancing without failing the run: the first machine to register gets
  all 45 specs and runs for ~16 minutes while the others run nothing, and
  React CI takes 17–19 minutes.
- **CMS** never used Cloud. Its 27 specs were split by hand into seven
  jobs, one per suite. The suites are uneven (71 s to 284 s of tests),
  and each job builds a full site first (6–7 minutes), so seven site builds
  carried as little as a minute of testing each. The specs in
  `cypress/e2e/withMappings` are a deliberate group of their own and run
  apart from the rest.

In practice parallelization is the only Cloud feature we have drawn value
from. Screenshots and videos are produced by Cypress itself and uploaded
as CI artifacts; Cloud's run history, flake detection and Test Replay are
not part of how we work.

## Decision

Split specs across CI machines with
[cypress-split](https://github.com/bahmutov/cypress-split), an npm plugin
that needs no external service. It is written by Gleb Bahmutov, who built
Cypress's parallelization feature while working at Cypress.io
([his account](https://glebbahmutov.com/blog/cypress-parallel-free/)), and
is actively maintained and widely used.

- It runs in `setupNodeEvents` and narrows the spec list to the slice that
  `SPLIT` (machine count) and `SPLIT_INDEX` (this machine) name. The
  workflows set both from the job matrix. Without them every spec runs, so
  local runs are unaffected.
- It balances by duration, read from a timings file (`cypress/timings.json`
  in each project). A spec missing from the file counts as the average, so
  adding a spec needs no edit there.
- The timings file is committed, so every machine of a run splits from
  the same input and their slices always add up to the whole suite. A
  cached file would let machines that start at different times restore
  different versions, split differently and skip specs without failing.
- Each project's CI refreshes its own file from a green run on `develop`,
  where its whole suite runs on every push, at most once a week. It merges
  the machines' timings with cypress-split's own `cypress-split-merge`, as
  its author's
  [split workflow](https://github.com/bahmutov/cypress-workflows/blob/main/.github/workflows/split.yml)
  does. That averages a spec several machines report, so a refresh moves
  durations part of the way to the new measurement, which damps the noise
  of a single run. A separate job commits the file with the DPL Platform
  Bot's token and `[skip ci]`, apart from the merge, which runs code from
  npm. This is why the CMS tests run on `develop` as well as on pull
  requests.
- React keeps the **three machines** it had under Cypress Cloud, so its
  runs compare directly with the ones Cloud balanced. CMS runs the
  `withMappings` specs on one machine, as before, and splits the rest over
  **four**. Every machine pays a fixed setup before its first spec (React
  ~3 minutes, CMS ~7 minutes, mostly the site build), and adding machine
  n+1 saves only about `total test time / (n(n+1))`. For CMS a fifth
  machine would save under a minute while costing a full setup of runner
  time and one of the plan's 20 concurrent runners. Revisit the counts
  when setup or test time changes substantially.

## Consequences

- **No quota.** Parallelization no longer depends on a monthly allowance,
  so it cannot silently stop. Between July and October 2026 the quota was
  used up in 29 % of React CI's runs, which then took ~20 minutes against
  ~10 while Cloud balanced. With cypress-split the integration job is not
  slower than when Cloud balanced.
- **CMS uses fewer runners, not less wall-clock time.** Five machines
  instead of seven suite jobs are expected to take ~51 runner-minutes
  instead of ~64 per pull request, but the longest job stays at ~11
  minutes because setup dominates. Building the site once per run would
  lower setup and move the best machine count up.
- **Specs from different CMS suites share a site.** Each split machine runs
  a mix of suites on one freshly built site, where each suite used to get
  its own, and the webmaster specs now run with the wiremock mappings
  present.
- **Balancing is static.** A slice is fixed before the run, so a spec that
  slows down skews its machine until the next weekly refresh. Cloud
  balanced dynamically.
- **A bot commit per project at most weekly** on `develop`, pushed past the
  pull request rule. It only changes a timings file and starts no CI runs
  or deploys.
- **The CMS tests also run on every push to `develop`** that touches the
  CMS. That costs runner time, and catches CMS changes that pass
  separately but break together.
- **No Cypress Cloud dashboard** for these runs. Recording can be added
  back next to the split (for example only on `develop`) if run history is
  ever wanted; it is not needed for parallelization.
- **A dependency on one maintainer.** That maintainer is established in
  the Cypress community, and the plugin is small: if it stops being
  maintained, the slice selection is simple to replace with a local
  `setupNodeEvents` function reading the same environment variables.

## Alternatives considered

- **A paid Cypress Cloud plan** — rejected on cost, for a service whose
  only feature we use is parallelization.
- **Staying on the open-source plan** — rejected: test volume already
  exceeds its quota, and grows with every dependency update pull request.
- **Currents or Sorry Cypress** (third-party Cloud replacements) — not
  viable: Cypress blocks third-party orchestration from version 13
  ([Cypress](https://cypress.io/blog/update-defense-intellectual-property),
  [Currents](https://docs.currents.dev/integration-with-cypress/compatibility)),
  and we are currently on 15.
- **[Knapsack Pro](https://knapsackpro.com/)** in queue mode — balances
  dynamically and is free for non-commercial open-source projects, but
  adds an external service in place of the one we leave, and its
  documentation does not confirm support for current Cypress versions.
- **Hand-picked spec globs per job** (how CMS was split) — no dependency,
  but unbalanced, and every new spec needs a placement decision.
