# Flaky CI checks

Some checks fail now and then for reasons that have nothing to do with the
pull request. Before calling a failure flaky, compare it with the same job on
other pull requests and on `develop`. When it is one of the failures below,
re-run the failed jobs:

- GitHub answers `HTTP/2 504` while Composer downloads packages in
  `dev:reset`.
- `Go / Argos` fails in `pnpm recursive install` with `ENOENT` in the Cypress
  cache.
- `CMS / Check Drupal Config` fails with `Could not acquire processing lock`.

Add a failure here when it recurs across pull requests, and remove it once it
stops occurring.
