import assert from "node:assert/strict"
import { test } from "node:test"
import { fileURLToPath } from "node:url"

import { audit } from "./audit.ts"

// A miniature repository whose dependabot.yml has one block per case below.
const repoRoot = fileURLToPath(new URL("__fixtures__/repo", import.meta.url))

test("reads every block's lockfiles and points each finding at its line", async () => {
  const findings = (await audit(repoRoot)).map(f => `${f.line} ${f.kind}: ${f.message}`)

  assert.deepEqual(findings, [
    // /no-lock* also matches a file and a folder without package.json, which
    // are skipped like Dependabot does. The package without a lockfile fails,
    // and makes the block incomplete, so "@fixture/gone" (line 6) is not called dead.
    "3 unreadable: cannot read no-lockfile: no pnpm-lock.yaml",
    // pnpm: peer suffix dropped, devDependencies read, "held" still holds.
    "11 stale: @fixture/alpha 1.0.0 in pnpm is inside >=1, so every update of it is ignored. " +
      "Delete the rule, or raise its lower bound above the locked version.",
    // A rule for a package that is gone is dead, update-types or not.
    "15 dead: @fixture/gone matches no direct dependency in pnpm",
    // Composer: "v" prefix cleaned, transitive packages not counted.
    "20 stale: fixture/gamma 1.2.0 in composer is inside >=1.0.0, so every update of it " +
      "is ignored. Delete the rule, or raise its lower bound above the locked version.",
    "22 dead: fixture/transitive matches no direct dependency in composer",
    "24 unreadable: /missing matches no directory",
    "29 unchecked: no lockfile reader for github-actions, so this block is not checked",
  ])
})
