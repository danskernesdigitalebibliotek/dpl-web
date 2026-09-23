import semver from "semver"

/**
 * Dependabot's `versions:` list is OR-ed together, and each entry is written in
 * the *ecosystem's* constraint syntax: node-semver for npm, Composer constraints
 * for composer. Return a node-semver range string, or null when an entry can't
 * be expressed (the caller reports it as "unparseable").
 */
export function toNodeSemverRange(versions: (string | number)[], ecosystem: string): string | null {
  const parts = versions.map(v =>
    ecosystem === "composer" ? composerToNodeSemver(String(v)) : String(v).trim()
  )
  if (parts.some(p => p == null)) return null
  const range = parts.join(" || ")
  return semver.validRange(range, { includePrerelease: true }) ? range : null
}

/**
 * Composer constraint -> node-semver range. Handles what actually shows up in
 * ignore blocks; anything involving dev branches is declared unparseable.
 *
 *   ">=1.13.0"      -> ">=1.13.0"          (comparison operators are identical)
 *   "~1.2"          -> ">=1.2.0 <2.0.0"    (Composer: bump the last given part)
 *   "~1.2.3"        -> ">=1.2.3 <1.3.0"
 *   "^1.2"          -> "^1.2"              (caret is the same in both)
 *   "1.2.*"         -> "1.2.x"
 *   ">=1.0,<2.0"    -> ">=1.0 <2.0"        (comma is AND in Composer)
 *   "1.0 - 2.0"     -> "1.0 - 2.0"         (hyphen ranges are the same)
 *   "^1.0@dev"      -> "^1.0"              (stability flags dropped)
 *   "dev-main"      -> null
 */
export function composerToNodeSemver(constraint: string): string | null {
  const c = constraint.trim().replace(/@(dev|alpha|beta|RC|stable)$/i, "")
  if (/dev-|-dev$/.test(c)) return null

  return c
    .split("||")
    .map(alt =>
      alt
        .trim()
        .split(/\s*,\s*|\s+(?!-\s)/) // AND separators: comma or space (but keep "1.0 - 2.0")
        .filter(Boolean)
        .map(composerTermToNodeSemver)
        .join(" ")
    )
    .join(" || ")
}

function composerTermToNodeSemver(term: string): string {
  const t = term.replace(/^v/, "")
  if (t === "*") return "*"

  const tilde = t.match(/^~(\d+(?:\.\d+){0,3})$/)
  if (tilde) {
    const given = tilde[1]!
    const parts = given.split(".").map(Number)
    const lower = semver.coerce(given)!.version
    // The tilde lets the last given part grow, so the bound is the part before
    // it - except for a bare "~1", where the major is the only part there is.
    const upper = parts.length === 1 ? [...parts] : parts.slice(0, -1)
    upper[upper.length - 1]! += 1
    while (upper.length < 3) upper.push(0)
    return `>=${lower} <${upper.join(".")}`
  }

  // Wildcards: Composer's 1.2.* is node-semver's 1.2.x.
  return t.replace(/\*/g, "x")
}

/**
 * Installed versions come in slightly different dialects:
 *   Composer: "v1.2.3", "1.2.3", "2.0.0-beta1", "11.x-dev", "dev-main"
 *   pnpm:     "1.2.3" (peer suffix already stripped)
 * Return a clean semver string or null when the version isn't comparable.
 */
export function normaliseInstalled(raw: string | undefined | null): string | null {
  if (!raw) return null
  if (/dev-|-dev$/.test(raw)) return null
  return semver.valid(semver.clean(raw, { loose: true })) ?? semver.coerce(raw)?.version ?? null
}

if (import.meta.vitest) {
  const { describe, expect, it } = import.meta.vitest

  describe("composerToNodeSemver", () => {
    it.each([
      [">=1.13.0", ">=1.13.0"],
      ["~1", ">=1.0.0 <2.0.0"],
      ["~0", ">=0.0.0 <1.0.0"],
      ["~1.2", ">=1.2.0 <2.0.0"],
      ["~1.2.3", ">=1.2.3 <1.3.0"],
      ["1.2.*", "1.2.x"],
      [">=1.0,<2.0", ">=1.0 <2.0"],
      ["1.0 - 2.0", "1.0 - 2.0"],
      ["^1.0@dev", "^1.0"],
      ["dev-main", null],
      ["11.x-dev", null],
    ])("translates %s to %s", (composer, expected) => {
      expect(composerToNodeSemver(composer)).toBe(expected)
    })
  })

  describe("normaliseInstalled", () => {
    it.each([
      ["v1.2.1", "1.2.1"],
      ["2.0.0-beta1", "2.0.0-beta1"],
      ["11.x-dev", null],
      ["dev-main", null],
    ])("normalises %s", (raw, expected) => {
      expect(normaliseInstalled(raw)).toBe(expected)
    })
  })
}
