# Migrate JS tooling from Yarn Classic to pnpm

## Context

The mono-repo's four JavaScript projects (`react/`, `go/`,
`design-system/`, the `cms/` tooling, and `packages/*`) were managed with
**Yarn Classic (v1)**. That baseline had accumulated problems:

- **Yarn Classic is end-of-life.** It receives no active development, so we
  were building on a frozen tool.
- **Flat, hoisted `node_modules` allows phantom dependencies.** Because Yarn
  lifts all transitive dependencies to the top level, a project can `import`
  a package it never declared — it resolves only because some *other*
  dependency happened to install it. Such imports are invisible in the
  manifest, break the moment an unrelated upgrade drops the intermediary,
  and run at whatever version that intermediary pulled rather than one we
  pinned.
- **Poor support for monorepos** – with `yarn`, we had to run `yarn install`
  separately in each sub-project.
- **No workspace tying the sub-projects together.** Each sub-project was an
  island with its own independent install procedure, so the repo had no shared
  dependency graph and no single place to enforce version constraints or
  supply-chain policy. Local packages could not be linked as workspace
  members either — where one project consumes another (React imports from
  `@danskernesdigitalebibliotek/dpl-design-system`), the dependency was
  satisfied by a published/downloaded artifact rather than resolved from the
  sibling directory in the repo.
- **Growing usage of packages.** We expect to add more shared packages to the
  repo, and having good monorepo tooling makes it easier to manage them.

The migration also surfaced adjacent tech debt that was cleaned up in the
same change: the CMS consumed the React and design-system builds as
downloaded **Composer packages** (`cms/dev-scripts/dpl-react/*`), and CI had
grown into a sprawl of per-project, single-purpose workflows.

## Decision

Adopt **pnpm** as the package manager for the whole repo:

- A root `pnpm-workspace.yaml` spans `cms`, `design-system`, `go`, `react`,
  and `packages/*`.
- Each workspace package keeps its **own `pnpm-lock.yaml`**
  (`sharedWorkspaceLockfile: false`) rather than a single shared lockfile at
  the repo root. This is what lets Dependabot run a **separate configuration
  per package**: it cannot update a central workspace lockfile from
  per-directory update entries, but it can find and update a lockfile sitting
  next to each `package.json`. The Lagoon dockerfiles copy each package's
  lockfile alongside its manifest before `pnpm install --frozen-lockfile`.
- The version is pinned via `packageManager: pnpm@10.x` in the root
  `package.json` and provisioned through Corepack, so local and CI
  toolchains match.
- Supply-chain policy is declared centrally in `pnpm-workspace.yaml`:
  `minimumReleaseAge` (a 2-day quarantine on new versions),
  `blockExoticSubdeps`, and an `onlyBuiltDependencies` allowlist gating
  which packages may run install scripts. **Caveat:** pnpm 10.x silently
  ignores `minimumReleaseAge` when `sharedWorkspaceLockfile` is `false`, so
  the quarantine is currently *not* enforced — the setting is kept so the
  protection returns once that bug is fixed or we move off split lockfiles.

Alongside the switch:

- The CMS now builds the design-system and React **from source in-repo**
  (`task dev:cms:link:design-system`, `task dev:cms:link:react`, and the new
  `build-cms-assets` composite action) and bakes the artifacts into the
  Lagoon images. The Composer-package download tooling
  (`cms/dev-scripts/dpl-react/*`) is deleted.
- CI is consolidated: per-check workflows (`go-eslint-check`,
  `go-type-check`, `go-unit-test`, `react-tests`, `common-release-workflow`,
  and others) collapse into `go-ci.yml` and `react-ci.yml`, sharing a
  `common-setup-js` composite action that installs Node from a single root
  `.nvmrc`, installs pnpm, and caches the store.

## Consequences

- **Strict, symlinked `node_modules`.** Each package only sees what it
  declared; phantom-dependency imports now fail at install/build time
  instead of surviving as latent runtime landmines.
- **Faster installs and less disk use** thanks to pnpm's content-addressed
  store.
- **Supply-chain hardening is expressed once**, in the workspace file,
  rather than assumed.
- **Deterministic toolchain**: the pinned `packageManager` plus Corepack
  removes package-manager version drift between machines and CI.
- **One consumption path for CMS assets.** No more Composer indirection for
  React/design-system; the builds come from the same tree that produced
  them.
- **Less CI surface to maintain** — fewer workflow files, one shared setup
  action, one `.nvmrc`.
- Contributors must use pnpm (via Corepack); Yarn commands no longer apply.
- **Per-package lockfiles cost some deduplication** (each package resolves
  its own tree) in exchange for per-package Dependabot updates, and require
  the quarantine caveat above until pnpm fixes `minimumReleaseAge` under
  split lockfiles.

## Alternatives considered

- **Yarn Berry (v3/v4)** and **npm workspaces** — considered but not chosen.
  Surveying other Node.js projects, pnpm seems to be the most popular choice,
  especially for monorepos. Libraries used by the project, like Next.js, also
  use pnpm. Yarn Berry is more difficult to adopt, due to its “plug-and-play”
  dependency management model that is not well supported across the Node.js
  ecosystem. npm workspaces are more bare-bones and pnpm is significantly faster
  and we have experience with it from other projects.
- **A single shared root lockfile** (pnpm's default) — rejected because
  Dependabot cannot update a central workspace lockfile from its
  per-directory update entries.
- **One workspace-wide Dependabot configuration** instead of per-package
  configs — rejected as impractical given the web of differing versions and
  ignore rules across the packages.
