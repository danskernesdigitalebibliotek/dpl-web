import { readFile } from "node:fs/promises"

import type { Installed } from "../types.ts"

interface ComposerPackage {
  name: string
  version: string
}

/**
 * composer.lock is plain JSON. `packages` and `packages-dev` list every
 * installed package (direct and transitive) with its exact `version`.
 * Dependabot only opens version-update PRs for direct dependencies by default,
 * so we filter to what composer.json declares in require / require-dev when it
 * is present; without it we fall back to everything in the lock.
 */
export async function readComposerLock(file: string, importer: string): Promise<Installed> {
  const manifest = await readFile(file.replace(/composer\.lock$/, "composer.json"), "utf8").catch(
    () => null // No composer.json beside the lock; fall back to every package.
  )
  return parseComposerLock(await readFile(file, "utf8"), manifest, importer)
}

/** The parsing half of {@link readComposerLock}, without the file access. */
export function parseComposerLock(
  lockText: string,
  manifestText: string | null,
  importer = "."
): Installed {
  // Composer has no workspaces: a lock file describes its own directory only.
  // Reading a parent's lock for a subdirectory would attribute that parent's
  // dependencies to it.
  if (importer !== ".") {
    throw new Error(`describes its own directory, not ${importer}`)
  }
  const lock = JSON.parse(lockText) as {
    packages?: ComposerPackage[]
    "packages-dev"?: ComposerPackage[]
  }

  let direct: Set<string> | null = null
  if (manifestText !== null) {
    const manifest = JSON.parse(manifestText) as {
      require?: Record<string, string>
      "require-dev"?: Record<string, string>
    }
    direct = new Set([
      ...Object.keys(manifest.require ?? {}),
      ...Object.keys(manifest["require-dev"] ?? {}),
    ])
  }

  const installed: Installed = new Map()
  for (const pkg of [...(lock.packages ?? []), ...(lock["packages-dev"] ?? [])]) {
    if (direct && !direct.has(pkg.name)) continue
    installed.set(pkg.name, pkg.version)
  }
  return installed
}

if (import.meta.vitest) {
  const { describe, expect, it } = import.meta.vitest

  const lock = JSON.stringify({
    packages: [
      { name: "acme/direct", version: "1.2.3" },
      { name: "other/transitive", version: "9.9.9" },
    ],
    "packages-dev": [{ name: "acme/dev", version: "2.0.0" }],
  })
  const manifest = JSON.stringify({
    require: { "acme/direct": "^1.2" },
    "require-dev": { "acme/dev": "^2.0" },
  })

  describe("parseComposerLock", () => {
    it("keeps only what composer.json declares, dropping transitive packages", () => {
      expect([...parseComposerLock(lock, manifest)]).toEqual([
        ["acme/direct", "1.2.3"],
        ["acme/dev", "2.0.0"],
      ])
    })

    it("falls back to every package when there is no composer.json", () => {
      expect([...parseComposerLock(lock, null)].map(([name]) => name)).toContain("other/transitive")
    })

    it("refuses a subdirectory, since a lock describes its own directory only", () => {
      expect(() => parseComposerLock(lock, manifest, "nested")).toThrow("its own directory")
    })
  })
}
