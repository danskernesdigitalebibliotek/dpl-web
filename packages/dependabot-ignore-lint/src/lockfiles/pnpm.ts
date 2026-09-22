import { readFile } from "node:fs/promises"
import { parse } from "yaml"

import type { Installed } from "../types.ts"

interface PnpmImporter {
  dependencies?: Record<string, { version?: string }>
  devDependencies?: Record<string, { version?: string }>
  optionalDependencies?: Record<string, { version?: string }>
}

/**
 * Read the direct dependencies of one importer (workspace package) from a
 * pnpm-lock.yaml. Supports lockfile v6 and newer, which keep an `importers` map
 * keyed by path relative to the lockfile, with `.` for the lockfile's own
 * directory, and each dependency as { specifier, version }. Before v6 that was
 * a bare version string with the specifier held elsewhere, so an older lockfile
 * is refused rather than read as having no dependencies at all.
 *
 * The format is simple enough that parsing it with `yaml` is preferable to
 * pulling in `@pnpm/lockfile.fs` and its transitive pnpm internals.
 */
export async function readPnpmLock(file: string, importer = "."): Promise<Installed> {
  return parsePnpmLock(await readFile(file, "utf8"), importer)
}

/** The parsing half of {@link readPnpmLock}, without the file access. */
export function parsePnpmLock(text: string, importer = "."): Installed {
  const lock = parse(text) as {
    lockfileVersion?: string | number
    importers?: Record<string, PnpmImporter>
  }
  const version = Number.parseFloat(String(lock.lockfileVersion ?? 0))
  if (!(version >= 6)) {
    throw new Error(
      `lockfileVersion ${lock.lockfileVersion ?? "missing"} is not supported (v6 or newer)`
    )
  }

  const section = lock.importers?.[importer]
  if (!section) {
    throw new Error(`no importer '${importer}' (workspace package not in lockfile?)`)
  }

  const installed: Installed = new Map()
  for (const group of ["dependencies", "devDependencies", "optionalDependencies"] as const) {
    for (const [name, entry] of Object.entries(section[group] ?? {})) {
      const resolved = normalisePnpmVersion(entry.version)
      if (resolved) installed.set(name, resolved)
    }
  }
  return installed
}

/**
 *  "9.1.2(react@18.3.1)(typescript@5.6.2)" -> "9.1.2"   (peer suffix)
 *  "link:../design-system"                 -> null      (workspace link)
 *  "npm:string-width@4.2.3"                -> "4.2.3"   (alias)
 *  "https://.../foo.tgz"                   -> null      (tarball)
 */
export function normalisePnpmVersion(raw: string | undefined): string | null {
  if (typeof raw !== "string") return null
  if (raw.startsWith("link:") || raw.startsWith("file:") || /^https?:/.test(raw)) return null
  let v = raw.replace(/\(.*$/, "")
  if (v.startsWith("npm:")) v = v.slice(v.lastIndexOf("@") + 1)
  return v || null
}

if (import.meta.vitest) {
  const { describe, expect, it } = import.meta.vitest

  describe("normalisePnpmVersion", () => {
    it.each([
      ["9.1.2(peer-lib@18.3.1)", "9.1.2"],
      ["npm:aliased-lib@4.2.3", "4.2.3"],
      ["link:../other-package", null],
      ["https://example.com/foo.tgz", null],
    ])("normalises %s", (raw, expected) => {
      expect(normalisePnpmVersion(raw)).toBe(expected)
    })
  })
}

if (import.meta.vitest) {
  const { describe, expect, it } = import.meta.vitest

  const lock = `
lockfileVersion: '9.0'
importers:
  .:
    dependencies:
      plain:
        specifier: ^1.0.0
        version: 1.2.3
      with-peers:
        specifier: ^9.0.0
        version: 9.1.2(peer-lib@18.3.1)
      linked:
        specifier: workspace:*
        version: link:../elsewhere
    devDependencies:
      dev-only:
        specifier: ^2.0.0
        version: 2.5.0
  pkg/a:
    dependencies:
      scoped:
        specifier: ^4.0.0
        version: 4.1.0
`

  describe("parsePnpmLock", () => {
    it("reads one importer's dependencies across all groups", () => {
      expect([...parsePnpmLock(lock)]).toEqual([
        ["plain", "1.2.3"],
        ["with-peers", "9.1.2"],
        ["dev-only", "2.5.0"],
      ])
    })

    it("skips a dependency with no comparable version", () => {
      expect([...parsePnpmLock(lock)].map(([name]) => name)).not.toContain("linked")
    })

    it("reads a named importer rather than the lockfile's own directory", () => {
      expect([...parsePnpmLock(lock, "pkg/a")]).toEqual([["scoped", "4.1.0"]])
    })

    it("refuses a directory the lockfile has no importer for", () => {
      expect(() => parsePnpmLock(lock, "pkg/missing")).toThrow("no importer")
    })

    it("refuses a pre-v6 lockfile, whose importers hold bare version strings", () => {
      const v5 = "lockfileVersion: 5.4\nimporters:\n  .:\n    dependencies:\n      plain: 1.2.3\n"
      expect(() => parsePnpmLock(v5)).toThrow("not supported")
    })
  })
}
