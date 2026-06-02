# AGENTS.md — design-system

Context for working in the DPL Design System — the shared visual language
for the Danish Public Libraries.

Read [the root `AGENTS.md`](../AGENTS.md) first if you haven't.

> **Heads-up:** this project is on a slow path to being **retired**. The
> plan is to absorb styling into `/react` and `/cms` directly, removing the
> duplicate-code overhead of maintaining a separate package. Don't invest in
> heavy new infrastructure here without checking; small, targeted changes
> are still expected.

## What this ships — the contract

This is the single most-misunderstood thing in this project. Internalise it
before editing:

- **The product is HTML markup + CSS classes**, not React components.
  Consumers read the *HTML tab* in Storybook (powered by
  `@whitespace/storybook-addon-html`) and paste the markup into their own
  templates — Drupal Twig in the CMS theme, JSX in React, etc.
- **React + Storybook is scaffolding**, used for authoring, previewing, and
  visual-regression testing. There is no exported React component API. The
  published npm package's `files` field is `build/**/*`.
- **The public API is the contents of `build/`** — compiled CSS, copied
  icons, copied fonts, and loose `.js` behaviours. Consumers import paths
  like `…/build/css/base.css` and `…/build/icons/basic/icon-search.svg`.
- **Markup is the wire format.** Class names, attribute order, and element
  nesting all become part of the contract once a component ships. Changing
  `<div class="card">` to `<article class="card">` is a breaking change.

## SCSS — tokens, mixins, BEM

A few rules that override generic SCSS instincts:

- **No inlined values** for spacing, font size, line-height, colour,
  breakpoint, or z-index. Tokens live in `src/styles/scss/tools/`. If the
  token you want doesn't exist, add it there — don't redefine locally.
- **Typography goes through `@include typography($typo__h2)`**, not raw
  `font-size`/`line-height`.
- **Media queries go through `@include media-query__<name>`** so breakpoints
  stay in sync.
- **BEM with file-name-as-block.** `counter.scss` → every selector starts
  with `.counter`. No deep `&__title` ampersand chaining. Max nesting depth
  is 3, enforced.
- **A new component's SCSS won't ship** unless you also `@import` it from
  `base.scss` (and possibly `wysiwyg.scss` / `admin-base.scss`). There is no
  glob — this is the most common omission.

## Icons — small but loaded with convention

- Source of truth: `public/icons/`, grouped by family. Two casing rules
  coexist deliberately: `basic/icon-name.svg` (kebab, lowercase prefix) vs.
  `collection/Name.svg` (PascalCase, no prefix). Stay consistent with the
  family you add to — consumer import paths bake in the casing.
- SVGs use `class=`, **not** `className=`. The same files are consumed
  unmodified by Drupal Twig. CRA's loader transforms `class` → `className`
  for the React preview side. Don't bulk-convert.
- Renaming or removing an icon is a breaking change for consumers.

## Where to learn more

- [`../docs/design-system/`](../docs/design-system/) — SCSS strategy, layout
  documentation, icon guidelines.
- [`../docs/design-system/architecture/`](../docs/design-system/architecture/)
  — ADRs (skeleton screens, form styling).
- `base.scss`, `wysiwyg.scss`, `admin-base.scss` — the three SCSS entry
  points (frontend, CKEditor, CMS admin).
- `src/styles/scss/tools/` — design tokens and mixins.
- `bundle.sh` — exactly what goes into the released package.
- `.storybook/main.js`, `.storybook/preview.js`, `.storybook/modes.js` —
  Storybook configuration, viewports, Chromatic modes.

## Gotchas worth knowing up front

- **Three CSS entry points, three audiences.** `base.scss` for the public
  site, `wysiwyg.scss` for CKEditor inside the CMS, `admin-base.scss` for
  the CMS admin UI. Don't add a component to all three "just in case" —
  opt in deliberately. The editor bundle in particular should stay small.
- **`bundle.sh`'s `.js` collector is flat and recursive** — every `*.js`
  under `src/` ends up in `build/js/`. Same-basename files in different
  folders will collide; name uniquely.
- **Loose `.js` companion files are framework-agnostic on purpose** so the
  CMS Twig and the React preview can both use them. Don't rewrite them as
  React hooks.
