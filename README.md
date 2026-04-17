# DPL Web Monorepo

Monorepo for the Danish Public Libraries (DPL) web platform, containing four interconnected projects.

## Projects

- **[cms](./cms/)** - Drupal CMS
- **[design-system](./design-system/)** - UI component library
- **[go](./go/)** - Next.js frontend
- **[react](./react/)** - React component library

## Documentation

**📖 [See full documentation](./docs/)**

For detailed information about the projects, setup instructions, and development guidelines, see the [docs](./docs/) directory.

## Quick Start

First, install [pnpm](https://pnpm.io/), preferably via [mise](https://mise.jdx.dev/).

Once it’s installed, run `pnpm install` in this folder to install JavaScript dependencies.

Each project has a `task dev:reset` command to set up the development environment:

- **CMS:** `cd cms && task dev:reset`
- **Design System:** `cd design-system && task dev:reset`
- **Go:** `cd go && task dev:reset`
- **React:** `cd react && task dev:reset`

See individual project documentation for additional commands.

## Resources

- [DPL Documentation Site](https://danskernesdigitalebibliotek.github.io/dpl-docs/)
- [Det Digitale Folkebibliotek](https://detdigitalefolkebibliotek.dk/)
