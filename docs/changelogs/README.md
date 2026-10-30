# Changelogs

Changelogs for interfaces that parties outside this repository depend on. Each
file follows the [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
format and is versioned by the CMS release tags (`YEAR.WEEK.PATCH`).

| Changelog                      | Covers                                            |
|--------------------------------|---------------------------------------------------|
| [`cms-rest.md`](./cms-rest.md) | The CMS REST API, specified in `cms/openapi.json` |

## Following a changelog

GitHub publishes an Atom feed of the commits touching a file. Consumers can
subscribe to it on `develop` to hear about changes before they are released,
e.g. for the CMS REST API:

<https://github.com/danskernesdigitalebibliotek/dpl-web/commits/develop/docs/changelogs/cms-rest.md.atom>

## Adding an entry

Every changelog has an `## Unreleased` section at the top. Add your entry
there, under the fitting subsection (`### Added`, `### Changed`,
`### Deprecated`, `### Removed`, `### Fixed` or `### Security`), creating the
subsection if it is not there yet:

```markdown
## Unreleased

### Added

- `GET /dpl_example/{id}`: Returns a single example.
```

Write for the consumer of the interface: what changed for them, and what they
have to do about it if anything. Breaking changes deserve a clear note.

A pull request that changes `cms/openapi.json` without also changing
`cms-rest.md` fails the `Changelog / CMS REST API` check.

## Releasing

A release must not ship with entries left under Unreleased: the
`Changelog / Released` check fails any pull request against `main` where a
changelog has some. Before opening the release pull request, move the entries
under the version being released:

```shell
task changelog:release VERSION=2026.44.0
```

This inserts `## 2026.44.0 - <today>` right below `## Unreleased` in every
changelog with unreleased entries, leaving Unreleased empty for the next
round. Pass `DATE=YYYY-MM-DD` if the release goes out on another day. Changelogs
with nothing unreleased are left as they are. Commit the result and get it onto
the branch being released. `task changelog:check-released` runs the same check
as CI.

See [the CMS release documentation](../cms/releases.md) for the release as a
whole.

## Adding a changelog

Create a new `*.md` file here with the same header structure as the existing
ones, and an empty `## Unreleased` section. `task changelog:release` and the
`Changelog / Released` check pick up every `*.md` in this directory except this
README. If the changelog follows a specific file, add a workflow like
`.github/workflows/changelog-cms-rest.yml` that requires the changelog to
change along with it.
