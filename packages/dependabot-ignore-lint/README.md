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

left behind after an upgrade to 15.x ignores every later version, security
fixes included, and Dependabot does not say so. This tool does, on the pull
request that made the rule obsolete.

| kind         | meaning                                                                  | fails |
| ------------ | ------------------------------------------------------------------------ | ----- |
| `stale`      | for a package it covers, the rule ignores every update, or none          | yes   |
| `dead`       | `dependency-name` matches no direct dependency in any of its directories | yes   |
| `unreadable` | a directory the block names is missing, or its lockfile cannot be read   | yes   |
| `unchecked`  | an ecosystem, range or version this tool cannot judge                    | no    |

A rule is stale when the locked version is inside its range and so is
everything above it (`>=15` with 15.2 locked), or when nothing in its range
is above the locked version (`<5` with 6.2 locked). A rule that still ignores
some later versions but not all, such as `6.1.x` with 6.1.0 locked, may well
be deliberate and is left alone, as is one pinning exactly the locked version
(`>1.1.0` with 1.1.0 locked). Rules scoped only by `update-types` cannot go
stale, but can be dead.

Delete a stale or dead rule, or raise the lower bound of a stale one past the
locked version (`>=18` became `>=19` when design-system was on 18). When the
rule still holds back other packages a wildcard matches, or the same package
in another directory of the block, the finding says so: split the rule, or
the block, so it no longer covers what made it stale.

Only the lockfile in each directory is read: `pnpm-lock.yaml` for `npm`, and
`composer.lock` (filtered to what `composer.json` requires) for `composer`.
Ranges are compared with node-semver. Syntax Dependabot reads differently is
left unchecked: Composer's `~`, `,` and stability flags, Ruby's `~>`, and `>`
or `<=` on a partial version such as `>1.0`.

## Running it

```sh
task ci:dependabot-ignore-lint
```

CI runs it, the type check and the tests from
`.github/workflows/dependabot-ignore-lint.yml`. Locally, inside this
directory: `pnpm run lint:ignores`, `pnpm test`, `pnpm run typecheck`.
