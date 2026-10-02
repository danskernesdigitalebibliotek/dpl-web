import { readFile } from "node:fs/promises"

import type { Installed } from "../types.ts"

interface NpmLockPackage {
  version?: string
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
  optionalDependencies?: Record<string, string>
}

/**
 * package-lock.json / npm-shrinkwrap.json, lockfileVersion 2 or 3. Direct deps
 * of the root package live under packages[""]; their resolved versions under
 * packages["node_modules/<name>"]. For workspaces the package's own entry is
 * packages["<importer>"] and its deps are hoisted or nested. If this ever gets
 * hairier, `@npmcli/arborist`'s loadVirtual() handles all of it properly.
 */
export async function readNpmLock(file: string, importer = "."): Promise<Installed> {
  return parseNpmLock(await readFile(file, "utf8"), importer)
}

/** The parsing half of {@link readNpmLock}, without the file access. */
export function parseNpmLock(text: string, importer = "."): Installed {
  const lock = JSON.parse(text) as {
    packages?: Record<string, NpmLockPackage>
  }
  if (!lock.packages) {
    throw new Error("lockfileVersion 1 is not supported (npm 7+ lockfiles only)")
  }
  const rootKey = importer === "." ? "" : importer
  const root = lock.packages[rootKey]
  if (!root) throw new Error(`no package entry for '${importer}'`)

  const installed: Installed = new Map()
  for (const group of ["dependencies", "devDependencies", "optionalDependencies"] as const) {
    for (const name of Object.keys(root[group] ?? {})) {
      const nested = lock.packages[`${rootKey ? rootKey + "/" : ""}node_modules/${name}`]
      const hoisted = lock.packages[`node_modules/${name}`]
      const version = (nested ?? hoisted)?.version
      if (version) installed.set(name, version)
    }
  }
  return installed
}

if (import.meta.vitest) {
  const { describe, expect, it } = import.meta.vitest

  const lock = JSON.stringify({
    lockfileVersion: 3,
    packages: {
      "": { dependencies: { hoisted: "^1.0.0" }, devDependencies: { "dev-only": "^2.0.0" } },
      "node_modules/hoisted": { version: "1.4.0" },
      "node_modules/dev-only": { version: "2.5.0" },
      "node_modules/transitive": { version: "9.9.9" },
      "pkg/a": { dependencies: { nested: "^3.0.0" } },
      "pkg/a/node_modules/nested": { version: "3.1.0" },
    },
  })

  describe("parseNpmLock", () => {
    it("reads the root package's direct dependencies, not transitive ones", () => {
      expect([...parseNpmLock(lock)]).toEqual([
        ["hoisted", "1.4.0"],
        ["dev-only", "2.5.0"],
      ])
    })

    it("prefers a workspace's own nested copy over the hoisted one", () => {
      expect([...parseNpmLock(lock, "pkg/a")]).toEqual([["nested", "3.1.0"]])
    })

    it("refuses a lockfileVersion 1 file, which has no packages map", () => {
      expect(() => parseNpmLock(JSON.stringify({ dependencies: {} }))).toThrow("lockfileVersion 1")
    })

    it("refuses a directory the lockfile has no entry for", () => {
      expect(() => parseNpmLock(lock, "pkg/missing")).toThrow("no package entry")
    })
  })
}
