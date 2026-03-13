# DPL Web Monorepo Documentation

Welcome to the DPL Web monorepo documentation. This repository contains four interconnected projects that together form the Danish Public Libraries (DPL) web platform.

## Projects

### 📚 [CMS](./cms/)

Drupal-based content management system for Danish public libraries.

**Start here:** [CMS Documentation](./cms/README.md)

---

### 🎨 [Design System](./design-system/)

Shared UI component library and design foundation.

**Start here:** [Design System Documentation](./design-system/README.md)

---

### 🚀 [Go](./go/)

Next.js-based public library website.

**Start here:** [Go Documentation](./go/README.md)

---

### ⚛️ [React](./react/)

React component library for self-service features.

**Start here:** [React Documentation](./react/README.md)

---

## Cross-Project Development

For developing across CMS, React, and Design System together (building, linking assets, watch mode), see **[Cross-Project Development](./development.md)**.

---

## Getting Started

### Prerequisites

Check the individual project documentation for specific requirements. Generally you'll need:

- Node.js (check `.nvmrc` files in each project)
- Yarn
- Docker
- go-task (optional, for task runner)
- Composer (for CMS)

### Development

Each project has a consistent `task dev:reset` command to set up the development environment:

- **CMS:** `cd cms && task dev:reset` (see [CMS docs](./cms/README.md))
- **Design System:** `cd design-system && task dev:reset` (see [Design System docs](./design-system/README.md))
- **Go:** `cd go && task dev:reset` (see [Go docs](./go/README.md))
- **React:** `cd react && task dev:reset` (see [React docs](./react/README.md))

---

## Monorepo Structure

```
dpl-web/
├── .github/          # Workflows and configurations
├── cms/              # Drupal CMS
├── design-system/    # UI component library
├── go/               # Next.js frontend
├── react/            # React component library
└── docs/             # Documentation (you are here)
```

---

## Development

### Workflows

GitHub Actions workflows are located in `.github/workflows/` and prefixed by project name (`cms-*`, `design-system-*`, `go-*`, `react-*`).

### Dependencies

Dependabot configuration is unified at `.github/dependabot.yml` and manages all projects.

---

## Contributing

Refer to individual project documentation for guidelines and conventions.

---

## Resources

- [Main DPL Documentation Site](https://danskernesdigitalebibliotek.github.io/dpl-docs/)
- [Det Digitale Folkebibliotek](https://detdigitalefolkebibliotek.dk/)
- [GitHub Organization](https://github.com/danskernesdigitalebibliotek)
