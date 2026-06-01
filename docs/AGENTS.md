# AGENTS.md — docs

Context for navigating and writing long-form documentation in this repo.

## How docs are organised

Each subproject has its own folder here ([`cms/`](./cms/), [`react/`](./react/),
[`go/`](./go/), [`design-system/`](./design-system/)). Inside each, the
documentation falls into two distinct categories:

- **Topic docs at the root of the folder** describe the system *as it is
  today* — how config management works, how to add a REST endpoint, how
  translations flow, how mocking is wired up. These are living documents:
  update them when the answer changes.
- **`architecture/adr-NNN-*.md`** files are **Architectural Decision
  Records**. Each ADR captures *why* a particular decision was made, in the
  context that existed at the time. ADRs are essentially immutable — when a
  decision is reversed or superseded, you write a *new* ADR that references
  the old one, rather than rewriting history. They are the place to look
  when you need to understand the reasoning behind something that looks odd.

When you find yourself asking "why is it like this?" — look for an ADR
first. When you find yourself asking "how do I do X?" — look at the topic
docs first.

## Writing new docs

- If you're documenting *how a thing currently works*, it goes in the
  relevant subproject folder as a topic doc.
- If you're capturing a *decision and its reasoning*, it goes under
  `architecture/` as the next-numbered ADR.
- Cross-project topics (working in the CMS + React + design-system loop)
  live at the docs root — see [`development.md`](./development.md).

## Related

- Public DPL documentation site:
  <https://danskernesdigitalebibliotek.github.io/dpl-docs/>. That is the
  audience-facing docs surface; this folder is the source-code-adjacent one.
- The CMS docs folder also has a `Taskfile.yml`, `diagrams/`, and
  `images/` — diagrams are programmatic where possible (PlantUML, draw.io),
  re-rendered via `task render`.
