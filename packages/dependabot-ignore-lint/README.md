# @danskernesdigitalebibliotek/dpl-dependabot-ignore-lint

Fails CI when an `ignore` rule in `.github/dependabot.yml` no longer holds
anything back.

We add an ignore rule when a Dependabot update cannot go in right away. When
the dependency is later upgraded or removed some other way, the rule tends to
stay behind. A rule like

```yaml
- dependency-name: some-package
  versions: [">=15"]
```

left behind after an upgrade to 15.x blocks every later 15.x patch and minor
update, and Dependabot does not say so. This tool does, on the pull request
that made the rule obsolete.

| kind         | meaning                                                                  | fails |
| ------------ | ------------------------------------------------------------------------ | ----- |
| `stale`      | the version in the lockfile is inside the rule's `versions` range        | yes   |
| `dead`       | `dependency-name` matches no direct dependency in any of its directories | yes   |
| `unreadable` | a directory the block names is missing, or its lockfile cannot be read   | yes   |
| `unchecked`  | an ecosystem, range or version this tool cannot judge                    | no    |

Delete a stale or dead rule. A stale wildcard rule (`@storybook/*`) usually
still holds its other matches back, so split it into one rule per package
instead. Rules scoped only by `update-types` cannot go stale, but can be dead.

Only the lockfile in each directory is read: `pnpm-lock.yaml` for `npm`, and
`composer.lock` (filtered to what `composer.json` requires) for `composer`.
Composer ranges must use syntax that means the same in node-semver
(comparisons, `^`, `*`); `~`, `,` and stability flags are left unchecked.

## Running it

```sh
task ci:dependabot-ignore-lint
```

CI runs it, the type check and the tests from
`.github/workflows/dependabot-ignore-lint.yml`. Locally, inside this
directory: `pnpm run lint:ignores`, `pnpm test`, `pnpm run typecheck`.
