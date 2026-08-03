![GO logo](../public/icons/logo-white-readme.svg)

<p>
  <br/>
  Website for the public library that uses <a href="https://nextjs.org" target="_blank">Next.js</a> with the <a href="https://nextjs.org/docs/app" target="_blank">App Router</a> for the frontend and <a href="https://www.drupal.org/" target="_blank">Drupal</a> for content management.
  <br>
  Drupal CMS can be accessed through Lagoon by generating a one-time login in the preferred environment.
  <br>
  <br>
</p>

## URLs

| Description                                             | URL                                                        |
| ------------------------------------------------------- | ---------------------------------------------------------- |
| Demo site (may change)                                  | <https://node.pr-1707.dpl-cms.dplplat01.dpl.reload.dk/>    |
| Demo site Drupal CMS (may change, login through lagoon) | <https://varnish.pr-1707.dpl-cms.dplplat01.dpl.reload.dk/> |

## Table of contents

- [URLs](#urls)
- [Table of contents](#table-of-contents)
- [Getting started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Setup](#setup)
- [Technical Overview](#technical-overview)
  - [Project structure](#project-structure)
  - [git workflows](#git-workflows)
- [Development](#development)
  - [UI components from shadcn/ui](#ui-components-from-shadcnui)
  - [Tailwind](#tailwind)
  - [Codegen](#codegen)
  - [Codegen types](#codegen-types)
  - [Custom types](#custom-types)
  - [xState](#xstate)
  - [Config handling](#config-handling)
  - [Storybook](#storybook)
  - [Cypress](#cypress)
- [Deployment](#deployment)
  - [git branches and pull requests](#git-branches-and-pull-requests)
  - [Create pull request](#create-pull-request)
  - [Reviewing a PR](#reviewing-a-pr)
  - [Updating the demo site](#updating-the-demo-site)
  - [Releases](#releases)
- [Quality assurance](#quality-assurance)
  - [GitHub Workflows for quality assurance](#github-workflows-for-quality-assurance)
- [Developers](#developers)

## Getting started

### Prerequisites

- Node.js – version specified in `.nvmrc`, managed via [nvm](https://github.com/nvm-sh/nvm) or similar tools.
- [pnpm](https://pnpm.io/) – version specified in `package.json`, can be installed using corepack or similar tools.

### Setup

1. Install dependencies by running `pnpm install` from the **repository root**. This installs dependencies for all workspace members including `go/`.

2. Start the development server:

We run the server in an [experimental https](https://nextjs.org/docs/pages/api-reference/cli/next#next-dev-options) state to not get blocked by CORS policy when developing locally.

```bash
pnpm run dev:https
```

The application is now running at [https://localhost:3000](https://localhost:3000)

4. Set up the Drupal CMS ([dpl-cms][dpl-cms]) locally to access configuration variables for the Go app. Ensure the `DPL_CMS_BASE_URL` variable in the `.env.local` file points to the correct endpoint.

## Technical Overview

- [Next.js][nextjs] with the [App Router][app-router]
- [React][react]
- [React Query][react-query]
- [TypeScript][typescript]
- [shadcn/ui][shadcn]
- [Tailwind CSS][tailwind]
- [ESLint][eslint] & [Prettier][prettier]
- [Storybook][storybook] & [Chromatic][chromatic]
- [cypress][cypress]
- [Vitest][vitest]

### Project structure

In the project, you'll see the following folders and files:

| File(s)                  | Description                                                                                                                                               |
| ------------------------ |-----------------------------------------------------------------------------------------------------------------------------------------------------------|
| \_\_tests\_\_/\*         | Unit tests for the application components and utilities. Using [vitest][vitest]                                                                           |
| .github/\*               | GitHub configuration files and workflows                                                                                                                  |
| .storybook/\*            | Configuration files and stories for Storybook                                                                                                             |
| .vscode.example/\*       | Example settings and recommendations for Visual Studio Code workspace                                                                                     |
| app/\*                   | Routes for the [App Router][app-router]                                                                                                                   |
| components/global/\*     | Components that should always be rendered on the page                                                                                                     |
| components/pages/\*      | For page layout components used as children on routes (Useful when making API calls server-side on the route and render page layouts as child components) |
| components/paragraphs/\* | Components named according to Drupal CMS conventions for editorial sections on a page                                                                     |
| components/shadcn/\*     | Imported [shadcn/ui][shadcn] components                                                                                                                   |
| components/shared/\*     | Reusable components that can be optionally used across various other components                                                                           |
| hooks/\*                 | Custom React hooks                                                                                                                                        |
| lagoon/\*                | TODO: add description                                                                                                                                     |
| lib/\*                   | Library utilities and configurations                                                                                                                      |
| lib/config/\*            | Centralized access to environment variables and CMS configuration settings                                                                                |
| lib/graphql/\*           | GraphQL-related utilities and configurations                                                                                                              |
| lib/graphql/fetchers/\*  | Custom fetch functions used for fetching data through [React Query][react-query]                                                                          |
| lib/graphql/fragments/\* | GraphQL fragments used to define reusable pieces of data queries                                                                                          |
| lib/graphql/generated/\* | Auto-generated GraphQL types and queries based on the GraphQL schema                                                                                      |
| lib/graphql/queries/\*   | Custom GraphQL queries used throughout the application                                                                                                    |
| lib/helpers/\*           | Utility functions and helpers used across the application                                                                                                 |
| lib/machines/\*          | State machines and related logic for managing complex state transitions through [xstate][xstate]                                                          |
| lib/providers/\*         | Context providers and related logic for managing global state and dependencies                                                                            |
| lib/rest/\*              | REST API-related utilities and configurations                                                                                                             |
| lib/rest/publizon-api/\* | Custom functions and configurations for interacting with the Publizon API                                                                                 |
| lib/session/\*           | Session management utilities and configurations                                                                                                           |
| lib/shadcn/\*            | Utilities for shadcn/ui components                                                                                                                        |
| lib/types/\*             | Manually added types used throughout the application                                                                                                      |
| public/\*                | Non-code, unprocessed assets (fonts, icons, etc.)                                                                                                         |
| styles/\*                | Global [Tailwind] CSS files                                                                                                                               |
| .editorconfig/           | Configuration file for maintaining consistent coding styles between different editors and IDEs                                                            |
| .env                     | Symlink to the root `.env` (git ignored), created by `task init`                                                                                          |
| .env.local               | Local environment variables file, specific to your development environment (git ignored)                                                                  |
| .env.test                | Environment variables file for testing                                                                                                                    |
| .eslintignore            | File specifying which files and directories to ignore by ESLint                                                                                           |
| .eslintrc.json           | Configuration file for ESLint rules and settings                                                                                                          |
| .gitignore               | Specifies intentionally untracked files to ignore                                                                                                         |
| .nvmrc                   | Node version manager configuration file                                                                                                                   |
| .prettierignore          | File specifying which files and directories to ignore by Prettier                                                                                         |
| codegen.ts               | Configuration file for generating code based on GraphQL schema                                                                                            |
| components.json          | Configuration file for defining and managing component metadata (necessary when installing shadcn components)                                             |
| next.config.mjs          | Next.js configuration file                                                                                                                                |
| orval.config.ts          | Configuration file for Orval, a tool for generating API clients from OpenAPI specifications                                                               |
| package.json             | Contains metadata about the project and its dependencies, scripts, and other configurations                                                               |
| postcss.config.mjs       | Configuration file for PostCSS, a tool for transforming CSS with JavaScript plugins (necessary for Tailwind to compile)                                   |
| tailwind.config.ts       | [Tailwind] CSS configuration file                                                                                                                         |
| Taskfile.yml             | Task automation file used to define and run tasks                                                                                                         |
| tsconfig.json            | TypeScript configuration file                                                                                                                             |
| vitest.config.ts         | Configuration file for [Vitest][vitest]                                                                                                                   |

### git workflows

| File                      | Description                                                                                                                                                                                                       |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| go-ci.yml                 | Everything that gates a change to `go/` or `packages/`: ESLint, Prettier, type check, Vitest unit tests, a check that the committed generated clients are up to date, a Storybook build shared by the accessibility (Axe/Playwright) and Chromatic jobs, and Cypress E2E. |
| go-build-base-image.yml   | Builds `go/lagoon/base.dockerfile` and pushes it to `ghcr.io/danskernesdigitalebibliotek/dpl-web-go`. Called by `lagoon-deploy.yml`, and runs on its own for semver tags.                                          |
| lagoon-deploy.yml         | Builds the Go base image, then sends a deploy webhook to Lagoon for pull requests and pushes to `develop`, `main`, `go-demo` and `go-playground`.                                                                  |
| lagoon-close.yml          | Tears down the Lagoon environment when a pull request is closed.                                                                                                                                                  |

## Development

### UI components from shadcn/ui

We use [shadcn/ui][shadcn] to speed up the development of UI components. Imported components are located in [/components/shadcn](./components/shadcn/).

If you're developing a component that requires additional logic beyond the initially installed component styles or logic, copy the imported code into a new component in the [/components/shared](./components/shared/) folder. This ensures that components imported by shadcn do not replace previously installed components.

### Tailwind

We use Tailwind CSS to style the project. Tailwind's predefined classes are configured in the `tailwind.config.ts` file, which references CSS variables defined in the `globals.css` file. This ensures that CSS variables are accessible through both CSS and Tailwind classes when developing components. When creating new variables, add the style as a variable in the `globals.css` file and include this variable in the Tailwind config. Additionally, the [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss) extension provides autocomplete features for a smoother development experience.

When introducing new classes, make sure to reuse existing ones and maintain consistency. Use the grid system for placing elements and apply the predefined spacing variables consistently.

### Codegen

In this project, we use codegen to generate REST clients (via `orval`) and GraphQL types and queries (via `graphql-codegen`) from API contracts. The contracts are **vendored** in the repo-root [`/schemas`](../../schemas/) directory — codegen never live-introspects a running service. See [`/schemas/README.md`](../../schemas/README.md) for the design rules and the `task schemas:refresh:*` flow that keeps the vendored contracts up to date.

Run all generators via `task codegen` (or any of the per-generator subtasks listed by `task --list`):

```bash
task codegen                  # all generators
task codegen:rest-services    # orval — REST clients
task codegen:graphql          # graphql-codegen — dpl-cms + FBI from /schemas SDL
task codegen:publizon         # orval — Publizon adapter
task codegen:pubhub           # SOAP — PubHub
task codegen:unilogin         # SOAP — Unilogin
```

Generated output lives in `lib/rest/` (REST), `lib/graphql/generated/` (GraphQL), and `lib/soap/` (SOAP). To pick up upstream schema changes, refresh the relevant contract in `/schemas` first (`task -d ../schemas refresh:dpl-cms-graphql`, `:dbc-fbi:fbcms-go`, `:material-list`, …) and then re-run codegen here.

### Custom types

Custom types are manually defined TypeScript types that are used throughout the application to ensure type safety and improve code readability.

When creating a custom type, please write a `T` before the name of the type to refer to the variable as a type. This helps to avoid confusion between types and other functionalities.

To add a custom type, create a new file in the `lib/types` directory and define your types using TypeScript's `type` or `interface` keywords.

### xState

Read about xState [here](architecture/adr-002-xstate.md).

### Config handling

Read about configuration [here](architecture/adr-001-configuration.md).

### Storybook

Storybook is an essential tool in our development workflow for several reasons:

1. **Component Isolation**: It allows us to develop and test UI components in isolation, ensuring that each component works as expected without dependencies on the rest of the application.
2. **Visual Documentation**: Storybook provides a visual representation of our components, making it easier for developers and designers to understand and collaborate on the UI.
3. **Automated Testing**: With integrations like Chromatic, we can automate visual regression testing to catch UI changes and bugs early in the development process.
4. **Reusable Components**: By documenting components in Storybook, we promote reusability and consistency across the application, reducing duplication and improving maintainability.

To start Storybook, run the following command:

```bash
pnpm run storybook
```

This will launch the Storybook server, and you can view the component library in your browser at [http://localhost:6006](http://localhost:6006).

**_We create Storybook stories strictly on a "render component" basis. This means focusing on smaller atomic components that are not specific to generated code._**

### Cypress

Cypress is an end-to-end testing framework that allows us to write and run tests for the application's core user journeys.

To start Cypress, run the following commands:

```bash
pnpm run dev # Start the development server
pnpm run cypress:run # Run all Cypress tests
```

## Deployment

### git branches and pull requests

We follow a specific Git branching model as the project is currently in development mode and not yet live. The main branches are:

- `main`: Used for deploying code to the demo environment. (In the future this will be the production branch)
- Feature branches are created from `main` and are named using the following convention:

```bash
DDFBRA-220-opstart-dokumentation
```

- `DDFBRA`: Workspace in Jira
- `220`: Ticket number
- `opstart-dokumentation`: Ticket title

Gotha: When creating a branch, use the Jira tickets `create branch` button to create a branch that refers to the ticket.

When a feature is complete, all test are passing and a review process has taken place, it is merged back into `main`.

### Create pull request

When creating a pull request, follow these steps:

1. Create a new pull request `feature`->`main`.
2. Add relevant information to the PR template. At a minimum, include a link to the ticket (if available) and a description.
3. Resolve any merge conflicts, fix errors in workflows, and check Chromatic to ensure new changes do not cause conflicts in the app. The PR creator is responsible for these checks.
4. Await approval from a relevant team member for the changes to the code.
5. Merge the code to `main` and delete the feature branch to clean up.

### Reviewing a PR

1. Review the code changes to ensure they meet the project's coding standards and requirements.
2. Provide constructive feedback and request any necessary changes. **Suggestions** are optional for the creator to fix, while **change requests** must be addressed.
3. Approve the PR if everything looks good, or request changes if there are issues that need to be addressed.

### Updating the demo site

Deploys are automated — there is nothing to build, publish or wire up by hand.
Push the code you want to demo to the `go-demo` branch:

```bash
git push origin my-feature:go-demo --force
```

`.github/workflows/lagoon-deploy.yml` builds the Go base image, then tells
Lagoon to build and deploy the full stack (CMS + Go) on top of it. The same
applies to `go-playground`, and every pull request gets its own throwaway
environment.

The branch environments are shared, so coordinate before force-pushing. For the
environment URLs, the build pipeline and how the CMS domain is resolved, see
[Go Lagoon deployment and branch environments](guides/git-branch-development-demo-workflow.md).

### Releases

When a release tag is published, `.github/workflows/go-build-base-image.yml`
picks it up and publishes a Docker image to
`ghcr.io/danskernesdigitalebibliotek/dpl-web-go:<tag>`. Individual library
environment repositories pin that tag through their `GO_RELEASE` variable, which
their `lagoon/node.dockerfile` template builds `FROM` — see `dpl-platform`.

The tag also triggers the CMS source image; that side of the release is
documented in [CMS releases](../cms/releases.md).

## Quality assurance

Quality assurance (QA) is a critical aspect of our development process, ensuring that the application meets the required standards and functions correctly. By implementing robust QA practices, we can identify and address issues early, maintain code quality, and deliver a reliable product to users.

**_As an overall rule of thumb, we add different levels of quality assurance depending on the given problem._**

#### GitHub Workflows for quality assurance

These all run as jobs in `go-ci.yml` on every pull request touching `go/` or
`packages/`:

1. **Automated Unit Testing**: the `unit` job runs Vitest, ensuring that individual components and utilities function correctly. This helps catch bugs early in the development process.

2. **End-to-end Testing**: the `e2e` job runs Cypress to simulate user interactions and test the application's core user journeys. This helps ensure that the application and important features work as expected.

3. **Code Quality Checks**: the `eslint` and `prettier` jobs enforce coding standards and consistent formatting. This ensures that the codebase remains clean, readable, and maintainable.

4. **Type Safety**: the `typecheck` job runs TypeScript checks to ensure type safety across the project. This helps prevent type-related errors and improves code reliability.

5. **Accessibility Testing**: the `accessibility` job runs accessibility tests on each [Storybook] Story using [Axe] through [Playwright]. This ensures that the application meets accessibility standards and provides a better user experience for all users.

6. **Visual Regression Testing**: the `chromatic` job runs Chromatic to visualize and test UI components in [Storybook]. This helps catch visual regressions and ensures that UI changes do not introduce unexpected issues.

7. **Generated code drift**: the `codegen` job re-runs the client generators and fails if the committed output differs, so the checked-in clients cannot silently fall out of sync with the schemas.

## Developers

- Adam Antal - <adam@reload.dk>
- Mikkel Jakobsen - <mikkel@reload.dk>
- Thomas Gross Rasmussen - <tgr@reload.dk>
- Jacob Pihl - <jacob@reload.dk>

[nextjs]: https://nextjs.org/
[app-router]: https://nextjs.org/docs/app
[react]: https://react.dev/
[shadcn]: https://ui.shadcn.com/
[typescript]: https://www.typescriptlang.org/
[tailwind]: https://tailwindcss.com/
[eslint]: https://eslint.org/
[prettier]: https://prettier.io/
[storybook]: https://storybook.js.org/
[chromatic]: https://www.chromatic.com/
[react-query]: https://tanstack.com/query/latest/docs/framework/react/overview
[xstate]: https://xstate.js.org/
[vitest]: https://vitest.dev/
[axe]: https://playwright.dev/docs/accessibility-testing
[playwright]: https://playwright.dev/
[cypress]: https://www.cypress.io/
[dpl-cms]: https://github.com/danskernesdigitalebibliotek/dpl-web/tree/main/cms
