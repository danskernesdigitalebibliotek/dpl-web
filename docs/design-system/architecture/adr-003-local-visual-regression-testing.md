# Architecture Decision Record: Local visual regression testing

## Context

The design system uses [Chromatic](https://www.chromatic.com/) for visual
regression testing of Storybook components. Chromatic is a paid SaaS service
with per-snapshot pricing. Due to the current structure of the design system,
any change triggers 640 snapshots (320 stories at two viewports: 400px mobile
and 1200px desktop).

[Chromatic has a generous free tier of 35.000 snapshots/month for open-source 
projects](https://www.chromatic.com/docs/open-source/) but we are currently using 
more than 70.000/month which drives up costs.

We expect this cost will increase with agentic workflows that iterate on code 
changes and trigger multiple builds per session.

## Decision

We will introduce local visual regression testing alongside Chromatic using
open-source tools that run without external service dependencies:

- **[Storybook test-runner](https://github.com/storybookjs/test-runner)** 
  uses Playwright to visit each story and capture full-page screenshots at both
  mobile (400px) and desktop (1200px) viewports — matching Chromatic's
  configuration. It is the official Storybook test tool, ensuring compatibility 
  with Storybook upgrades.
- **[jest-image-snapshot](https://github.com/americanexpress/jest-image-snapshot)**
  for pixel-level comparison of screenshots against committed baselines. It 
  integrates directly with Jest (already used by the test-runner) and supports 
  multiple comparison algorithms and configurable thresholds.
- **[peter-evans/create-pull-request](https://github.com/peter-evans/create-pull-request)**
  for CI integration. When visual changes are detected, a new pull request is 
  created against the original pull request branch containing the updated 
  baselines. Developers can review visual diffs using GitHub's native image diff
  viewer and merge the pull request to accept changes.

## Alternatives considered

### Use Chromatic Turbosnap

An alternate way to reduce costs is to use Chromatic's proprietary [Turbosnap](https://www.chromatic.com/docs/turbosnap) 
feature. Turbosnap reduces costs for snapshots of stories that are determined
to be unaffected by a given change. This requires that we build a proper 
dependency graph of stories and their dependencies. This is not possible with
our current Storybook setup where all stories get their styling from the single
`base.css` file, which is also consumed by the React components and CMS.

Reworking this would require a significant and non-trivial effort. To avoid
visual regressions this would again require a significant amount of snapshots
driving up costs.

In any case: Turbosnap does full rebuilds of snapshots for every dependency 
change in `package.json` and lock files. This drives up costs for Dependabot 
updates in any case.

### Use reg-actions for CI reporting

[reg-actions](https://github.com/reg-viz/reg-actions) is a tool-agnostic 
GitHub Action for creating visual diff reports and managing them as GitHub
pull request comments. 

However, this action relies on storing baselines as ephemeral GitHub artifacts 
and/or in a separat branch rather than using committed baselines which follow
individual commits. This means baselines can expire (90-day retention) and 
baselines are not auditable in git history.

## Consequences

### Transition from Chromatic to local tooling

During a transition period, both Chromatic and the local tooling will run in
parallel on the same pull requests. This allows us to discover discrepancies
between the two approaches and build confidence in the local tooling. Once
stabilized, Chromatic will be fully removed.

The design system is the largest source of Chromatic snapshots in the project,
making it the highest-impact candidate for migration. If this process is 
successful, the same approach should be applied to the Go project which also 
uses Chromatic for visual regression testing.

### Baselines stored in the repository

With this approach baselines are stored in the repository alongside the code.
This provides full auditability and transparency into the visual effects of a
change.

The current set of baselines takes up 48MB of space. This is a significant 
amount of data to store in a repository. [GitHub has some limits on the size of
a repository (10GB), size of a single file (1MB/100MB)etc.](https://docs.github.com/en/repositories/creating-and-managing-repositories/repository-limits).
These limits will not be a problem with the new setup.

The primary impact developers will experience will be the time it takes to clone 
the repository locally and in GitHub workflows.

#### Git LFS

If having the baselines in the repository becomes a problem we can migrate
storage to [Git LFS](https://git-lfs.com/).[This is also supported by GitHub](https://docs.github.com/en/repositories/working-with-files/managing-large-files/configuring-git-large-file-storage).

It is worth noting that [Git LFS is a paid service on GitHub](https://docs.github.com/en/billing/concepts/product-billing/git-lfs) 
- also for open-source projects - with a free tier of 10GB. A back of the
napkin estimate based on usage from april says we will spend about 20GB/month
on LFS. Effective use of [`actions/cache`](https://github.com/actions/cache) in
GitHub workflows will reduce this significantly. We do this already. 
 
In any case the [pricing of GitHub LFS](https://github.com/pricing/calculator?feature=lfs) 
should be a fraction of the cost of Chromatic.

### New tooling

Chromatic provides many different features as a part of their offering.
This new setup takes a different approach to some of them. We will need to 
evaluate the tradeoffs.

Known issues:

1. Visual diffs are reviewed in GitHub's PR diff viewer instead of Chromatic's
   dedicated UI. GitHub supports side-by-side, swipe, and onion skin comparison
   for images but the experience is less polished than Chromatic's.
2. No published Storybook for pull requests. This means that our primary way of
   inspecting changes becomes the snapshot diff report. If we want to look at
   Storybook for a pull request we have to run it locally. [The official 
   storybook for the project](https://danskernesdigitalebibliotek.github.io/dpl-web/design-system/) 
   is still [published to GitHub pages](../../../.github/workflows/design-system-gh-pages.yml).
3. Chromatic has proprietary features to tune 
   [what causes a diff to be reported](https://www.chromatic.com/docs/threshold/).
   We cannot replicate these features 1-1. We will need to update the 
   configuration once we get more experience with the new tooling. 
   [`jest-image-snapshot` provides many options to control the diff threshold](https://github.com/americanexpress/jest-image-snapshot#%EF%B8%8F-api).

### Test stability

To ensure deterministic screenshots, all story images are stored as local
fixtures in `src/stories/__fixtures__/images/` rather than loaded from external
URLs. An ESLint rule (`no-restricted-syntax`) prevents external URLs in `src`
attributes to avoid regressions. External URLs for non-image resources
(YouTube embeds, CDN scripts) are explicitly allowed via inline disables.
