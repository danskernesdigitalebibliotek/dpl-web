import semver from "semver"

import type { UpdateBlock } from "./config.ts"
import type { Installed } from "./lockfiles.ts"

export interface Finding {
  /**
   * stale: for some package it covers, the rule ignores either every update
   * or none at all. dead: the rule matches nothing it could apply to.
   * unreadable: a directory of the block could not be read. These fail.
   * unchecked: a rule or block this tool cannot judge; only a warning.
   */
  kind: "stale" | "dead" | "unreadable" | "unchecked"
  line: number
  message: string
}

/**
 * Compare one block's ignore rules with what its directories have locked.
 * `complete` says whether every directory of the block was read; a rule is
 * only called dead when it was, since a skipped directory could hold the match.
 */
export function evaluate(
  block: UpdateBlock,
  installed: Map<string, Installed>,
  complete: boolean
): Finding[] {
  const findings: Finding[] = []

  for (const rule of block.ignore) {
    if (!rule.name) continue
    const pattern = rule.name
    const matches = [...installed].flatMap(([dir, packages]) =>
      [...packages]
        .filter(([name]) => matchesName(pattern, name))
        .map(([name, version]) => ({ dir, name, version }))
    )

    if (matches.length === 0) {
      if (complete) {
        findings.push({
          kind: "dead",
          line: rule.line,
          message: `${pattern} matches no direct dependency in ${[...installed.keys()].join(", ")}`,
        })
      }
      continue
    }

    // Rules scoped only by update-types ("no majors") cannot go stale.
    if (rule.versions.length === 0) continue

    const range = toRange(rule.versions, block.ecosystem)
    if (!range) {
      findings.push({
        kind: "unchecked",
        line: rule.line,
        message: `cannot read versions ${JSON.stringify(rule.versions)} of ${pattern}`,
      })
      continue
    }

    const obsolete: string[] = []
    const holding: string[] = []
    for (const { dir, name, version } of matches) {
      const locked = semver.clean(version, { loose: true })
      const id = `${name} ${locked ?? version} in ${dir}`
      if (!locked) {
        findings.push({
          kind: "unchecked",
          line: rule.line,
          message: `${id} is not a comparable version`,
        })
      } else if (semver.satisfies(locked, range) && semver.subset(`>${locked}`, range)) {
        obsolete.push(`${id} is inside ${range}, so every update of it is ignored`)
      } else if (!semver.intersects(range, `>${locked}`)) {
        obsolete.push(`${id} is already past ${range}`)
      } else {
        // Still holds back later versions: all of them, as intended, or some,
        // like a bounded range skipping a broken release line.
        holding.push(id)
      }
    }

    if (obsolete.length === 0) continue
    findings.push({
      kind: "stale",
      line: rule.line,
      message:
        (pattern.includes("*") ? `${pattern}: ` : "") +
        obsolete.join("; ") +
        (holding.length === 0
          ? ". Delete the rule, or raise its lower bound above the locked version."
          : `, but it still holds back ${holding.join(", ")}. Split it so it no longer covers the former.`),
    })
  }

  return findings
}

/**
 * Dependabot's own name matching: `*` matches anything, `/` included, every
 * other character is literal, and case does not matter.
 */
export function matchesName(pattern: string, name: string): boolean {
  const body = pattern
    .split("*")
    .map(part => part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join(".*")
  return new RegExp(`^${body}$`, "i").test(name)
}

/**
 * The entries of `versions` are OR-ed and written in the ecosystem's syntax.
 * Comparisons, carets and wildcards mean the same to Composer and node-semver;
 * tilde, comma, stability flags and dev branches do not, so a Composer range
 * using them is left unchecked rather than misread.
 */
export function toRange(versions: string[], ecosystem: string): string | null {
  if (ecosystem === "composer" && versions.some(v => /[~,@]|dev/.test(v))) return null
  const range = versions.join(" || ")
  return semver.validRange(range) ? range : null
}
