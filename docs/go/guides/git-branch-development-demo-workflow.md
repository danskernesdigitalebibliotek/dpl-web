# Runbook: Go Lagoon Deployment and Branch Environments

## Overview

The Go (Next.js) application is built and deployed entirely by Lagoon. When a
PR is created or a dedicated branch is pushed, Lagoon checks out the code,
builds all Docker images (including the Go app), and deploys the full stack
(CMS + Go frontend).

No separate GitHub Actions build or container registry image is needed for
deployment — Lagoon handles the complete pipeline.

## Environment Types

### PR Environments (automatic)

Every pull request that touches `cms/**`, `go/**`, `.lagoon.yml`, or
`docker-compose.lagoon.yml` automatically gets a Lagoon environment:

| Service | URL                                                              |
| ------- | ---------------------------------------------------------------- |
| Go app  | `https://node.pr-{number}.{project}.dplplat02.dpl.reload.dk`    |
| CMS     | `https://varnish.pr-{number}.{project}.dplplat02.dpl.reload.dk` |

The environment is destroyed when the PR is closed.

### Dedicated Branch Environments

Two long-lived branch environments are available for demos and testing.
Each branch deploys a full stack (CMS + Go) with stable, predictable URLs.

| Branch          | Go app URL                                                        | CMS URL                                                              |
| --------------- | ----------------------------------------------------------------- | -------------------------------------------------------------------- |
| `go-demo`       | `https://node.go-demo.{project}.dplplat02.dpl.reload.dk`         | `https://varnish.go-demo.{project}.dplplat02.dpl.reload.dk`         |
| `go-playground` | `https://node.go-playground.{project}.dplplat02.dpl.reload.dk`   | `https://varnish.go-playground.{project}.dplplat02.dpl.reload.dk`   |

**Only one deployment per branch can exist at a time.** Git branch names are
unique, and Lagoon creates exactly one environment per branch. This prevents
multiple developers from accidentally claiming the same domain.

## How to Deploy to a Branch Environment

### 1. Check that no one else is using the environment

Coordinate with your team. The branch environment is shared — pushing to it
will overwrite whatever is currently deployed.

### 2. Push your changes to the branch

```bash
# Example: deploy your feature branch to the demo environment
git push origin my-feature:go-demo --force
```

This force-pushes your feature branch content to `go-demo`. Lagoon detects
the push and starts a new deployment.

### 3. Wait for the build

Monitor the deployment in the Lagoon UI:
`https://ui.lagoon.dplplat02.dpl.reload.dk/projects/{project}/{project}-go-demo/deployments`

The build installs dependencies, runs `yarn build` with the correct
environment variables, and starts the Go app alongside the CMS.

### 4. Access the environment

Once deployed, visit the URLs listed above for the branch you deployed to.

## How It Works (Technical)

### Build Pipeline

```
Push to branch/PR
       │
       ▼
Lagoon checks out repo
       │
       ▼
Builds go/lagoon/node-lagoon.dockerfile
  ┌─ Stage 1 (deps): install node_modules
  ├─ Stage 2 (builder): copy source, resolve CMS domain, pnpm run build
  └─ Stage 3 (runner): production image with start.sh
       │
       ▼
Deploys all services (node, varnish, nginx, php, cli, mariadb, redis)
```

### Environment Variable Resolution

The Go app needs to know the CMS domain at build time (for `NEXT_PUBLIC_*`
variables baked into the client bundle) and at runtime (for SSR).

**Build time** (`go/lagoon/node-lagoon.dockerfile`):

- CMS domain is derived from `LAGOON_ENVIRONMENT` and `LAGOON_PROJECT`
- Pattern: `varnish.{environment}.{project}.dplplat02.dpl.reload.dk`

**Runtime** (`go/lagoon/start.sh`):

- For `main`/`develop`: uses `LAGOON_DOMAIN` and `LAGOON_ROUTE` (production domains)
- For everything else (PR, go-demo, go-playground): derived from
  `LAGOON_ENVIRONMENT` and `LAGOON_PROJECT`

### Key Files

| File                               | Purpose                                                         |
| ---------------------------------- | --------------------------------------------------------------- |
| `go/lagoon/node-lagoon.dockerfile`  | Multi-stage Docker build for the Go app (used by Lagoon)        |
| `go/lagoon/node.dockerfile`        | Source image dockerfile for GHCR publishing                     |
| `go/lagoon/start.sh`               | Runtime startup script, sets env vars and runs `pnpm run start`     |
| `docker-compose.lagoon.yml`        | Defines all Lagoon services including `node`                    |
| `.lagoon.yml`                      | Lagoon project config, environment settings, post-rollout tasks |
| `.github/workflows/cms-lagoon.yml` | Sends webhook to Lagoon on push/PR events                       |

## Resetting a Branch Environment

To reset a branch environment to match `develop`:

```bash
git push origin develop:go-demo --force
```

## FAQ

### Can I deploy any branch to go-demo or go-playground?

Yes. Force-push any branch to `go-demo` or `go-playground` and Lagoon
will build and deploy it.

### What if two people push to the same branch at the same time?

Lagoon queues builds. The last push wins — the most recent code is what
gets deployed.

### Do I need to configure anything in Lagoon?

The branch must be allowed in the Lagoon project's branch deployment
settings. Ask a Lagoon administrator to enable the `go-demo` and
`go-playground` branches if they are not already configured.
