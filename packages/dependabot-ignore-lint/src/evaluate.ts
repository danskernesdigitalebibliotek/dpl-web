import semver from "semver"

import { isWildcard, wildcardMatch } from "./names.ts"
import { normaliseInstalled, toNodeSemverRange } from "./ranges.ts"
import type { Finding, IgnoreEntry, Installed, ResolvedBlock } from "./types.ts"

/**
 * Turn resolved blocks into findings. Everything here is a comparison between
 * an ignore entry and the versions a directory has installed - reading
 * dependabot.yml, expanding directories and parsing lockfiles all happen in
 * audit.ts, so this stays testable without a repository on disk.
 *
 * Finding kinds:
 *  - stale        installed version already satisfies the ignored range, so the
 *                 entry no longer blocks the upgrade it was written for and is
 *                 now suppressing patch/minor updates *within* that range
 *  - partial      a wildcard entry stale for only some of the packages it
 *                 matches; it still holds the rest back, so it has to be split
 *  - dead         dependency-name matches nothing in any directory the block
 *                 covers, so the entry can never apply to anything
 *  - unparseable  we could not turn the versions/installed value into semver
 *  - skipped      a directory was not audited; the reason comes from audit.ts
 *
 * `update-types` entries ("no majors") cannot be stale in this sense and are
 * not checked.
 */
export function evaluate(resolved: ResolvedBlock[]): { findings: Finding[]; comparisons: number } {
  const findings: Finding[] = []
  let comparisons = 0

  for (const { block, audited, skipped } of resolved) {
    if (block.ignore.length === 0) continue

    for (const { dir, reason } of skipped) {
      findings.push({ kind: "skipped", dir, configLine: block.line, detail: reason })
    }

    // A rule is only dead when no directory matched, so the verdict waits for
    // the whole block.
    const matchedSomewhere = new Set<IgnoreEntry>()
    for (const [dir, installed] of audited) {
      for (const entry of block.ignore) {
        const result = evaluateEntry(entry, dir, installed, block.ecosystem)
        if (result.matched) matchedSomewhere.add(entry)
        comparisons += result.comparisons
        findings.push(...result.findings)
      }
    }

    // A skipped directory could have been the match, so an incomplete block
    // never condemns a rule.
    if (skipped.length > 0 || audited.size === 0) continue
    const dirs = [...audited.keys()]
    const where = dirs.length === 1 ? "the directory" : `any of the ${dirs.length} directories`
    for (const entry of block.ignore) {
      const name = entry["dependency-name"]
      if (!name || matchedSomewhere.has(entry)) continue
      findings.push({
        kind: "dead",
        dir: dirs.join(", "),
        dependencyName: name,
        configLine: entry.line,
        detail: `matches no direct dependency in ${where} this block covers`,
      })
    }
  }

  return { findings, comparisons }
}

interface EntryResult {
  /** Whether the entry matched at least one installed package here. */
  matched: boolean
  /** (entry, installed package) pairs compared. */
  comparisons: number
  findings: Finding[]
}

/** Evaluate one ignore entry against one directory's installed packages. */
function evaluateEntry(
  entry: IgnoreEntry,
  dir: string,
  installed: Installed,
  ecosystem: string
): EntryResult {
  const nothing = { matched: false, comparisons: 0, findings: [] }
  const name = entry["dependency-name"]
  if (!name) return nothing

  const matches = [...installed].filter(([n]) => wildcardMatch(name, n))
  if (matches.length === 0) return nothing
  if (!entry.versions?.length) return { matched: true, comparisons: 0, findings: [] }

  const range = toNodeSemverRange(entry.versions, ecosystem)
  if (!range) {
    return {
      matched: true,
      comparisons: 0,
      findings: [
        {
          kind: "unparseable",
          dir,
          dependencyName: name,
          configLine: entry.line,
          detail: `cannot translate versions ${JSON.stringify(entry.versions)}`,
        },
      ],
    }
  }

  const findings: Finding[] = []
  const stale: Finding[] = []
  let comparable = 0
  for (const [matchedName, rawVersion] of matches) {
    const version = normaliseInstalled(rawVersion)
    if (!version) {
      findings.push({
        kind: "unparseable",
        dir,
        dependencyName: matchedName,
        configLine: entry.line,
        detail: `installed version '${rawVersion}' is not comparable`,
      })
      continue
    }
    comparable++
    if (semver.satisfies(version, range, { includePrerelease: true })) {
      stale.push({
        kind: "stale",
        dir,
        dependencyName: matchedName,
        configLine: entry.line,
        installedVersion: version,
        ignoredRange: range,
        detail: `installed ${version} already satisfies ignored range '${range}'`,
      })
    }
  }

  // A wildcard stale for only some of its matches still holds the others back.
  // Deleting it unblocks them; it has to be split instead.
  if (isWildcard(name) && stale.length > 0 && stale.length < comparable) {
    findings.push({
      kind: "partial",
      dir,
      dependencyName: name,
      configLine: entry.line,
      ignoredRange: range,
      detail:
        `stale for ${stale.length} of ${comparable} matched packages ` +
        `(${stale.map(f => f.dependencyName).join(", ")}); split the rule, do not delete it`,
    })
  } else {
    findings.push(...stale)
  }

  return { matched: true, comparisons: matches.length, findings }
}

if (import.meta.vitest) {
  const { describe, expect, it } = import.meta.vitest

  const resolvedOf = (
    ignore: IgnoreEntry[],
    dirs: Record<string, Record<string, string>>,
    skipped: { dir: string; reason: string }[] = [],
    ecosystem = "npm"
  ): ResolvedBlock[] => [
    {
      block: { line: 1, ecosystem, directories: Object.keys(dirs), ignore },
      audited: new Map(Object.entries(dirs).map(([d, p]) => [d, new Map(Object.entries(p))])),
      skipped,
    },
  ]
  const kinds = (r: ResolvedBlock[]) =>
    evaluate(r).findings.map(f => `${f.kind}:${f.dependencyName ?? f.dir}`)

  describe("evaluate", () => {
    it("reports a rule the installed version already satisfies", () => {
      const r = resolvedOf([{ "dependency-name": "a", versions: [">=1"] }], { x: { a: "2.0.0" } })

      expect(kinds(r)).toEqual(["stale:a"])
    })

    it("says nothing about a rule that still holds its package back", () => {
      const r = resolvedOf([{ "dependency-name": "a", versions: [">=3"] }], { x: { a: "2.0.0" } })

      expect(kinds(r)).toEqual([])
    })

    it("never checks an update-types entry", () => {
      const r = resolvedOf(
        [{ "dependency-name": "a", "update-types": ["version-update:semver-major"] }],
        { x: { a: "2.0.0" } }
      )

      expect(evaluate(r)).toEqual({ findings: [], comparisons: 0 })
    })

    it("calls a wildcard partial when only some matches are stale", () => {
      const r = resolvedOf([{ "dependency-name": "@s/*", versions: [">=2"] }], {
        x: { "@s/one": "2.0.0", "@s/two": "1.0.0" },
      })
      const [finding] = evaluate(r).findings

      expect(finding?.kind).toBe("partial")
      expect(finding?.detail).toContain("1 of 2 matched packages")
    })

    it("counts only comparable matches in that ratio", () => {
      const r = resolvedOf([{ "dependency-name": "@s/*", versions: [">=2"] }], {
        x: { "@s/one": "2.0.0", "@s/two": "1.0.0", "@s/three": "dev-main" },
      })
      const partial = evaluate(r).findings.find(f => f.kind === "partial")

      expect(partial?.detail).toContain("1 of 2 matched packages")
    })

    it("reports a wildcard stale, not partial, when every match is stale", () => {
      const r = resolvedOf([{ "dependency-name": "@s/*", versions: [">=2"] }], {
        x: { "@s/one": "2.0.0", "@s/two": "3.0.0" },
      })

      expect(kinds(r)).toEqual(["stale:@s/one", "stale:@s/two"])
    })

    it("calls a rule dead when no directory of its block matches", () => {
      const r = resolvedOf([{ "dependency-name": "gone", versions: [">=1"] }], {
        one: { a: "1.0.0" },
        two: { b: "1.0.0" },
      })
      const [finding] = evaluate(r).findings

      expect(finding?.kind).toBe("dead")
      expect(finding?.dir).toBe("one, two")
      expect(finding?.detail).toContain("any of the 2 directories")
    })

    it("leaves a rule alone when it matches in one directory but not another", () => {
      const r = resolvedOf([{ "dependency-name": "a", versions: [">=9"] }], {
        one: { a: "1.0.0" },
        two: { b: "1.0.0" },
      })

      expect(kinds(r)).toEqual([])
    })

    it("condemns nothing in a block whose directories were not all read", () => {
      const r = resolvedOf(
        [{ "dependency-name": "gone", versions: [">=1"] }],
        { one: { a: "1.0.0" } },
        [{ dir: "two", reason: "no supported lockfile for npm" }]
      )

      expect(kinds(r)).toEqual(["skipped:two"])
    })

    it("reports a range it cannot translate, and an installed version it cannot read", () => {
      const r = resolvedOf(
        [
          { "dependency-name": "a", versions: ["dev-main"] },
          { "dependency-name": "b", versions: [">=1"] },
        ],
        { x: { a: "1.0.0", b: "dev-main" } },
        [],
        "composer"
      )

      expect(kinds(r)).toEqual(["unparseable:a", "unparseable:b"])
    })

    it("translates a Composer constraint before comparing", () => {
      // "~3.0" is >=3.0.0 <3.1.0 to node-semver but >=3.0.0 <4.0.0 to Composer,
      // so 3.5.0 is only inside the ignored range for one of them.
      const entry = [{ "dependency-name": "a", versions: ["~3.0"] }]
      const npm = resolvedOf(entry, { x: { a: "3.5.0" } })
      const composer = resolvedOf(entry, { x: { a: "3.5.0" } }, [], "composer")

      expect(kinds(npm)).toEqual([])
      expect(kinds(composer)).toEqual(["stale:a"])
    })
  })
}
