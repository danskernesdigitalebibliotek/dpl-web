# Dependabot triage

Dependabot is configured for all projects in
[`.github/dependabot.yml`](../../.github/dependabot.yml). Minor and patch updates
are merged automatically once every check is green. Everything else goes
through a weekly triage on Mondays.

This is the dpl-web part of the general
[vendor updates](https://danskernesdigitalebibliotek.github.io/dpl-docs/General/vendor-updates/)
process for DPL projects.

## Log

Write what you do in the Zulip topic **DDF > Depandabot Triage Log** as you go.
Focus on what differed from the usual procedure. Write pull requests and Jira
keys as full links: Zulip turns a bare `#1234` into a Zendesk link.

## Pull requests

List the open Dependabot pull requests by filtering on the `dependencies`
label or on the Dependabot author.

### Major updates

Never merge an update with failing checks. When the checks are green, judge
the risk of the update:

- **Impact**: an update to a core framework of a project is riskier than one
  to a library behind a single feature.
- **Usage**: a dependency that only runs in development or CI is less risky
  than one that ends up in production.
- **Test coverage**: an update to code that our tests cover is less risky.

Merge the update when the risk is low. Otherwise hold it back.

### Holding an update back

1. Add an `ignore` entry for the new version to the project in
   [`.github/dependabot.yml`](../../.github/dependabot.yml), with a comment that
   says why. For a new major version `N`, use `versions: [">=N"]`, so minor
   and patch updates within the current major version keep coming.
2. Create a Jira ticket for the upgrade. Describe the role the library plays
   in the project and why the update was held back, in Danish, and link the
   Dependabot pull request and the `ignore` entry that must be removed again.
3. Close the Dependabot pull request.

Do the upgrade later as a pull request of its own, with no unrelated changes.
When the update is blocked by another package, see
[Working with upstream](#working-with-upstream).

### Failing checks

First rule out a [flaky run](#flaky-checks). Then read the log of the failing job
to find out what the new version breaks:

- **A breaking change we can adapt to.** Read the changelog or migration
  guide. When the change is small, check out the branch, fix our code and push
  it to the Dependabot branch. Dependabot stops rebasing a pull request once
  someone else has pushed to it, so get it merged before it falls behind.
- **Not compatible with the rest of the setup**, typically a major version
  that a plugin or another dependency does not support yet. Hold the update
  back until the rest of the ecosystem has caught up.
- **A bug in the new version.** Check whether a fixed release is on its way.
  If it is, ignore only the broken version (`versions: ["x.y.z"]`), so the fix
  arrives as a new pull request.
- **One package fails a grouped pull request.** Hold back that package only,
  so the rest of the group can be merged on the next run.

### Flaky checks

Dependabot pull requests hit the same flaky failures as any other pull
request. See [Flaky CI checks](./flaky-ci.md) for how to recognise them.

Workflow runs on Dependabot pull requests can read Dependabot secrets, but
not Actions secrets. A new secret registered only as an Actions secret is
empty there, so a step that needs it fails on Dependabot pull requests only,
and re-running does not help. Register it as a Dependabot secret as well, as
is done for the WeDoBooks and Argos tokens.

### Minor and patch updates

These should have been merged automatically. When one is still open, the cause
is most likely a flaky CI run. Re-run the failed jobs, or comment
`@dependabot rebase` to start over.

The `Auto-merge Dependabot` check runs once per push and gives up as soon as
another check fails. After re-running the failed jobs, re-run the
`Auto-merge Dependabot` run as well, or the pull request stays open with green
checks.

When one Dependabot pull request is merged, Dependabot rebases the others, and
their checks run again.

### Code generation (Orval, GraphQL Codegen)

A new version of a code generator can change the generated code, so the
"up to date" check fails. Check out the branch locally, run the code
generation with the new version and push the result.

## Security alerts

Go through the open
[Dependabot alerts](https://github.com/danskernesdigitalebibliotek/dpl-web/security/dependabot).
For each alert, see whether the vulnerable package can be updated, including
when it is a transitive dependency, or whether the alert can be dismissed.

Judge an alert by where the package ends up and who can reach it, not by its
severity, and handle the alerts in that order. A package that only runs in CI
or development tools is a low risk, whatever its severity.

When the fix is only released in a version that a parent package does not
allow:

- In the npm projects, force the fixed version with `overrides:` in
  `pnpm-workspace.yaml`.
- In the CMS, backport the upstream fix as a Composer patch in `cms/patches/`.

See also [Working with upstream](#working-with-upstream).

Create a Jira ticket for the real upgrade.

When the fix reaches production, it also needs a hotfix for the release lines
the sites run. Editor sites and webmaster sites can be on different releases;
see `sites.yaml` in dpl-platform and the
[hotfix process](https://danskernesdigitalebibliotek.github.io/dpl-docs/General/hotfix-releases/).

The repository is public. Commits and pull requests name the package, the
version and the advisory, but not how our setup is reachable, measurements or
payloads.

An alert closes by itself when the version changes. When it is fixed without a
version change, or the vulnerable code is not used, dismiss it with a reason
and a comment that points at the patch or the Jira ticket. Dismissed alerts are
listed under `is:closed`, filtered by `resolution:fix-started` or
`resolution:not-used`.

## Working with upstream

When an update is blocked by another package, for example a plugin that does
not support a new major version, or a parent package that does not allow the
fixed version of a dependency, the fix belongs upstream. This applies to npm
packages and Drupal modules alike.

- Look for an existing issue or pull request in the package's issue tracker,
  on GitHub or in the drupal.org issue queue.
- If there is none, consider opening an issue, or a pull request with the
  update. It helps the maintainer, and the maintainer may push back with
  information we did not have.
- An upstream pull request or merge request can give us a patch to apply in
  the meantime. Composer patches in the CMS work well for this. In the npm
  projects, use an override to change which version of a dependency a package
  gets: [pnpm advises against](https://pnpm.io/cli/patch) patching a
  package's `package.json` to do that.
- Link the upstream issue in the Jira ticket and in the comment on the
  `ignore` entry or override, so the next triage can see whether it is
  resolved.

## Ignored dependencies

Go through the `ignore` entries for each project in
[`.github/dependabot.yml`](../../.github/dependabot.yml) and see whether any can
be removed. Use `git blame` to see how long an entry has been there.

The rules:

- Keep as few ignores as possible.
- An ignored dependency must not stay ignored for long.

## Overrides and patches

Overrides, and patches that backport an upstream fix, are workarounds until an
upstream release catches up. Go through them and remove those that are no
longer needed:

- `overrides:` in [`pnpm-workspace.yaml`](../../pnpm-workspace.yaml): remove an
  override once the parent package pulls in the fixed version by itself. To
  check, remove the override, run `pnpm install` in each project with a
  lockfile, and see with `pnpm why <package>` that it still resolves to a
  fixed version. While the override is in place, `pnpm why` only shows the
  forced version.
- `minimumReleaseAgeExclude:` in the same file: remove a package once the
  release it was excluded for is older than `minimumReleaseAge`.
- `extra.patches` in [`cms/composer.json`](../../cms/composer.json): a patch
  whose description names an upstream issue or advisory can go, along with its
  file in `cms/patches/`, once the fix is in a release we use. Patches without
  one are our own changes and stay. When an update makes the Composer install
  fail because a patch no longer applies, check whether the fix has landed
  upstream or the patch needs a reroll.
