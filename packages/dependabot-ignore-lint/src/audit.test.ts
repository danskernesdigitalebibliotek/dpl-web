import path from "node:path"
import { fileURLToPath } from "node:url"
import { beforeAll, describe, expect, it } from "vitest"

import { audit } from "./audit.ts"
import type { Finding } from "./types.ts"

const repoRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), "__fixtures__", "repo")

/**
 * These cover resolution: turning a block's `directory`/`directories` into real
 * directories, and finding the lockfile that governs each. What the audit then
 * concludes from the versions it reads is evaluate.ts's job, tested there from
 * in-memory inputs.
 */
describe("audit", () => {
  // The fixture is static, so one run serves every assertion below.
  let findings: Finding[]
  beforeAll(async () => {
    ;({ findings } = await audit({ repoRoot }))
  })

  const named = (name: string) => findings.find(f => f.dependencyName === name)
  const at = (dir: string) => findings.find(f => f.dir === dir)

  it("reads whichever lockfile governs a directory, per ecosystem", () => {
    // One stale rule per directory, so a finding means that parser ran.
    expect(named("alpha")).toMatchObject({ kind: "stale", dir: "pnpm", installedVersion: "1.0.0" })
    expect(named("beta")).toMatchObject({ kind: "stale", dir: "npm", installedVersion: "2.0.0" })
    expect(named("acme/gamma")).toMatchObject({ kind: "stale", dir: "composer" })
  })

  it("resolves a glob to the directory it matched", () => {
    // Reported against "no-lockfile", not the "/no-lock*" pattern, so expansion
    // happened. Whether glob can return several matches is Node's business.
    expect(at("no-lockfile")).toMatchObject({ kind: "skipped" })
    expect(at("no-lockfile")?.detail).toContain("no supported lockfile")
  })

  it("skips a pattern that matches nothing, however it is written", () => {
    expect(at("/missing")?.detail).toContain("no such directory")
    expect(at("/nothing*")?.detail).toContain("no such directory")
  })

  it("skips a directory the lockfile it walked up to does not describe", () => {
    // Without this the throw from readPnpmLock ended the whole run.
    expect(at("pnpm/nested")).toMatchObject({ kind: "skipped" })
    expect(at("pnpm/nested")?.detail).toContain("no importer 'nested'")
  })

  it("skips an ecosystem it has no lockfile reader for", () => {
    expect(at(".")?.detail).toContain("no supported lockfile for github-actions")
  })

  it("points every finding at the line in dependabot.yml it came from", () => {
    for (const f of findings)
      expect(f.configLine, `${f.dir}:${f.dependencyName ?? ""}`).toEqual(expect.any(Number))
  })

  it("reports the config path relative to the repository root", async () => {
    expect((await audit({ repoRoot })).configPath).toBe(".github/dependabot.yml")
  })
})
