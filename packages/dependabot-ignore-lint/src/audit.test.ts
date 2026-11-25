import assert from "node:assert/strict"
import { test } from "node:test"
import { fileURLToPath } from "node:url"

import { audit } from "./audit.ts"

// A miniature repository whose dependabot.yml has one block per case below.
const repoRoot = fileURLToPath(new URL("__fixtures__/repo", import.meta.url))

test("reads every block's lockfiles and points each finding at its line", async () => {
  const findings = (await audit(repoRoot)).map(f => `${f.line} ${f.kind}: ${f.message}`)

  assert.deepEqual(findings, [
    // A glob that matched a directory without a lockfile: the block is
    // incomplete, so "gone" (line 6) is not called dead.
    "3 unchecked: no-lockfile was not checked: cannot read pnpm-lock.yaml",
    // pnpm: peer suffix dropped, devDependencies read, "held" still holds.
    "11 stale: alpha in pnpm is locked at 1.0.0, inside the ignored range >=1",
    // A rule for a package that is gone is dead, update-types or not.
    "15 dead: gone matches no direct dependency in pnpm",
    // Composer: "v" prefix cleaned, transitive packages not counted.
    "20 stale: acme/gamma in composer is locked at 1.2.0, inside the ignored range >=1.0.0",
    "22 dead: acme/transitive matches no direct dependency in composer",
    "24 unchecked: /missing matches no directory",
    "29 unchecked: . was not checked: no lockfile reader for github-actions",
  ])
})
