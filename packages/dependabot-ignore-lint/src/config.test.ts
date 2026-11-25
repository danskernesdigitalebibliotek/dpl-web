import assert from "node:assert/strict"
import { mkdtemp, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import path from "node:path"
import { test } from "node:test"

import { loadConfig } from "./config.ts"

const load = async (yaml: string) => {
  const file = path.join(await mkdtemp(path.join(tmpdir(), "ignore-lint-")), "dependabot.yml")
  await writeFile(file, yaml)
  return loadConfig(file)
}

test("reads directory, directories and a bare-string versions", async () => {
  const blocks = await load(`version: 2
updates:
  - package-ecosystem: npm
    directory: "/one"
    ignore:
      - dependency-name: "a"
        versions: ">=2"
  - package-ecosystem: composer
    directories: ["/many/*", "/other"]
    ignore:
      - dependency-name: "b"
        update-types: ["version-update:semver-major"]
`)
  assert.deepEqual(blocks, [
    {
      ecosystem: "npm",
      directories: ["/one"],
      line: 3,
      ignore: [{ name: "a", versions: [">=2"], line: 6 }],
    },
    {
      ecosystem: "composer",
      directories: ["/many/*", "/other"],
      line: 8,
      ignore: [{ name: "b", versions: [], line: 11 }],
    },
  ])
})

test("refuses aliases, which would otherwise hide rules", async () => {
  await assert.rejects(
    load(`version: 2
updates:
  - package-ecosystem: npm
    directory: "/one"
    ignore: &shared
      - dependency-name: "a"
        versions: [">=2"]
  - package-ecosystem: npm
    directory: "/two"
    ignore: *shared
`),
    /aliases are not supported/
  )
})
