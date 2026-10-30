# Argos replaces Chromatic for visual regression testing

## Context

Visual regression testing is paid per screenshot, and the volume here is
high. The design system and Go screenshot every Storybook story at two widths
on each push to `main`, `develop` and `release/*` and on each non-draft pull
request, and compare the screenshots with those of the base branch. Dependabot
opens most of those pull requests, and the volume has more than doubled over
the past year. [Chromatic](https://www.chromatic.com/) did this from the
start, rendering the stories in its own cloud, and its bill grew with the
volume, past the screenshots its plan includes into overage. That is what
prompted looking for a tool with a lower rate per screenshot.

[Argos](https://argos-ci.com/) was piloted next to it from October 2026, first
in Go and then in the design system: Storybook's test runner screenshots the
same Storybook build in the Playwright image matching the installed Playwright,
and the Argos CLI uploads the screenshots.

The week of 21–26 October 2026 was the first with both tools on both projects.
Each captured about 77,000 images in about 160 builds, every build a full
capture of every story.

- **Signal.** Argos flagged no change in its 161 builds. Chromatic flagged a
  visual change in 10 Go builds on branches that only bumped dependencies or
  removed dead code; on inspection those were animation false positives.
  Whether Argos handles animations better by design or the pilot's capture
  is better tuned, the result is a week without a false positive, and that
  is what decides.
- **Cost.** At the measured volume Chromatic costs about four times what
  Argos does. Chromatic's plan has a fixed monthly floor several times
  Argos', and beyond the included screenshots its rate is about five times
  Argos' rate for Storybook screenshots, so the gap grows with volume.
- **Volume.** Dependabot pull requests were 59% of Go builds and 39% of
  design-system builds, and pushes to `develop` another quarter. Every one of
  them captures the whole Storybook at two widths.

## Decision

Argos is the visual regression tool for the design system and Go, and
Chromatic stops running. The `Design / Chromatic` workflow and the
`chromatic` job in `go-ci.yml` are removed, with the design system's
`chromatic` script and task and the Chromatic Storybook addon in Go and
React. Stories declare their screenshot widths in the `argos` Storybook
parameter only; Argos used to fall back to the `chromatic` one.

Every push to the baseline branches and every non-draft pull request,
Dependabot's included, keeps capturing every story.

The Chromatic projects and the repository secrets holding their tokens are
kept. No builds are sent to them, but their history stays, and the workflows
can be restored from git.

## Consequences

### Cost

Visual regression testing costs about a quarter of what it did at the measured
volume.

### Review and access

Each change is reviewed once, in Argos. The project is `reload/dpl-web`: anyone
can view its builds, approving needs membership of Reload's team, and reviewers
from outside Reload are not added to it. Should one be needed, the project moves
to a team of its own; a transfer keeps builds and baselines.

### Rendering is our responsibility

Chromatic rendered in its own cloud. Argos compares screenshots our CI takes, so
fonts, antialiasing and animation timing are ours to keep stable. The pilot's
setup handles this, and is where the next flake investigation starts:

- The browser runs in the Playwright image matching the installed
  Playwright, in CI and in the local capture task, so rendering changes
  only arrive with a Playwright bump and show in that pull request.
- The browser gets the text-rendering flags Argos recommends.
- Stories may only load files the Storybook serves. A story that requests
  anything else fails the capture, and the few exceptions are listed with
  their reasons.
- Go skips framer-motion animations and hides scrollbars from load during
  captures, which ended the keen-slider flake that failed `argos/go` on
  most pull requests before 19 October.
- Dates are frozen.
- Local captures on Apple Silicon still differ from CI on rotated content,
  so the local task checks that stories capture, and baselines come from
  CI only.

### Vendor

Argos is a smaller vendor than Chromatic, with an MIT-licensed platform.
Chromatic is built by Storybook's maintainers, so new Storybook releases are
supported there first; here both captures run on Storybook's test runner rather
than Argos' recommended Vitest route, which needs Vite while both Storybooks
build with webpack, and the design system's is frozen at 0.23.0, the last
release for Storybook 9. The capture pipeline is repo code. What is
Argos-specific is the screenshot call in the two test-runner hooks, the `argos`
Storybook parameters, the upload and deploy steps and the token, so a change of
backend replaces those and the review tool, not the capture.

### Time

Argos jobs are slower than Chromatic's were: by 48 s in Go, where the Playwright
container starts and installs, and by 196 s in the design system, where the
capture task builds Storybook inside Docker so that local and CI captures render
alike. The Argos run is the design system's slowest, within the range of its
accessibility run.

### Previews

Both Storybooks are deployed as Argos previews from their Argos jobs, so pull
requests keep a browsable Storybook link, as they had from Chromatic. On
`develop` the later of the two deployments is the production preview.

### Chromatic stays available but goes stale

Its projects keep their history, and keeping them needs no paid plan, as
Chromatic's free plan allows unlimited projects; whether a downgrade keeps build
history is unverified. Its baselines stop at the last build, so turning it back
on means accepting every story again.

### Pull requests from forks

They get no visual regression check, as they get no `ARGOS_TOKEN`.

### Visual checks in end-to-end tests become available

Argos compares screenshots the Cypress run itself takes, uploaded from CI like
the Storybook captures, so the CMS and Go Cypress suites can add visual
regression checks to the same project. Chromatic's Cypress integration instead
archives each page and re-renders it in Chromatic's cloud, which the team never
adopted.

## Alternatives considered

### Cutting the captured volume

Chromatic's TurboSnap captures only the stories a change affects, but a change
to `package.json` or a lockfile makes it capture everything, which nearly every
pull request here does, and it cannot trace the design system's SCSS, which
Storybook imports as precompiled CSS; even at its maximum discount, Chromatic's
rate per screenshot only draws level with Argos'. Skipping builds for pull
requests and `develop` pushes that only change package files, on either tool,
would cut the volume to roughly a third. Both leave a dependency bump that
changes rendering to be caught on `develop` after the merge at the earliest, so
the processes downstream of `develop` would carry regressions nobody saw.

### Self-built comparison with no paid service

Tried for the design system in spring 2026: Storybook's test runner with
jest-image-snapshot comparing against PNG baselines committed to the repository,
reviewed through GitHub's image diff, with an automated pull request updating
the baselines. Moving the capture into Docker changed 591 of 640 baselines
through font rendering, pinning the platform still left 77 changed, the
threshold needed to pass ended at 40% of pixels, which lets real regressions
through, CI never went green, and the baselines weighed 46 MB. Cross-platform
font rendering makes such a loop unfeasible, and the review and baseline
handling a hosted service provides is what the attempt showed was missing.

### Other hosted services

A quick survey of [Percy](https://percy.io/),
[Applitools](https://applitools.com/), [Lost
Pixel](https://github.com/lost-pixel/lost-pixel) and [Happo](https://happo.io/)
showed no pricing advantage over Argos or Chromatic.
