# AGENTS.md

Starting context for AI agents working in this repo. Reading this once should
leave you with roughly what a teammate already has in their head when they
open a new task — what *DPL* is, what each project actually does, and how the
pieces talk to each other.

## What this is

`dpl-web` is the codebase behind the shared web platform of the **Danish
Public Libraries** (*Danskernes Digitale Bibliotek, DDB*). A single codebase
here is deployed to **100+ individual library websites** — see
<https://fkb.dk/> for one running instance. The libraries differ in size and
ambition but share this platform, so a change to default behaviour ships to
all of them.

> **Disambiguation:** the site at <https://www.detdigitalefolkebibliotek.dk/>
> is a *separate, unrelated* project. Don't confuse it with this platform.

The repo is a mono-repo of four projects that together form the platform:

- **`cms/`** — A Drupal distribution. The editorial backend each library
  runs. It hosts content, configuration, and (today) embeds the React apps.
- **`react/`** — A library of small standalone React apps (search, loans,
  reservations, …) bundled per-app and embedded into CMS pages via
  `<div data-dpl-app="…">` containers.
- **`go/`** — A Next.js App Router frontend, the modern public-facing site.
  Aimed initially at youth audiences. Reads content and configuration from
  the CMS over GraphQL.
- **`design-system/`** — The shared visual language. Ships **HTML markup +
  CSS classes** (not React components) to consumers.

## How the projects relate

```
design-system  ──HTML+CSS──▶  cms (Drupal theme "novel")
                          └─▶  react (npm package)

react  ──bundled + embedded──▶  cms  ──GraphQL──▶  go
```

Go does **not** consume the design system today. React and Go don't talk to
each other.

## Where to learn more

- [`./docs`](./docs/) — long-form documentation. Each subproject has a README
  there, plus an `architecture/` folder of ADRs (Architectural Decision
  Records). See [`docs/AGENTS.md`](./docs/AGENTS.md) for how docs are
  organised and when to write what.
- Each subproject has its own **`AGENTS.md`**. Read the relevant one before
  editing inside that subproject — it captures the conventions and gotchas
  that are easy to get wrong from generic stack knowledge alone.
- Public docs (architecture, processes, releases):
  <https://danskernesdigitalebibliotek.github.io/dpl-docs/>.
- `Taskfile.yml` (root and per-subproject) is the index of human-runnable
  workflows — linting, formatting, codegen, dev servers, resets. When the
  next step in your work is to run a command, there is almost certainly a
  Task for it; surface that name to the developer rather than raw
  `yarn`/`composer`/`drush`/etc. Every task has a `desc:` (or `summary:`)
  field — `task --list` (or reading the file) is the fastest way to find
  the right one.
