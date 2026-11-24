# Dependabot triage

Dependabot is configured for all projects in
[`.github/dependabot.yml`](../.github/dependabot.yml). Minor and patch updates
are merged automatically once every check is green. Everything else goes
through a weekly triage on Mondays.

## Log

Write what you do in the Zulip topic **DDF > Depandabot Triage Log** as you go.
Focus on what differed from the usual procedure.

## Pull requests

List the open Dependabot pull requests by filtering on the `dependencies`
label or on the Dependabot author.

### Major updates

When the checks are green, judge whether the update is safe to merge, for
example because it is a development dependency.

### Minor and patch updates

These should have been merged automatically. When one is still open, the cause
is most likely a flaky CI run. Re-run the failed jobs, or comment
`@dependabot rebase` to start over.

### Code generation (Orval, GraphQL Codegen)

A new version of a code generator can change the generated code, so the
"up to date" check fails. Check out the branch locally, run the code
generation with the new version and push the result.

## Security alerts

Run the security triage in Claude Code:

```text
/security-triage Run this on the dpl-web project. Only look at:
https://github.com/danskernesdigitalebibliotek/dpl-web/security/dependabot.
Don't manipulate or search for any Jira tickets.
```

Follow the prioritised order in the report. Then go through the
[Dependabot alerts](https://github.com/danskernesdigitalebibliotek/dpl-web/security/dependabot)
and see whether transitive dependencies can be updated, or the alert
dismissed.

## Ignored dependencies

Go through the `ignore` entries for each project in
[`.github/dependabot.yml`](../.github/dependabot.yml) and see whether any can
be removed. Use `git blame` to see how long an entry has been there.

The rules:

- Keep as few ignores as possible.
- An ignored dependency must not stay ignored for long.
