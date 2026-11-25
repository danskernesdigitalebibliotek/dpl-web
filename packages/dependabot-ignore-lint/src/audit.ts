import { existsSync } from "node:fs"
import { glob } from "node:fs/promises"
import path from "node:path"

import { loadConfig } from "./config.ts"
import { evaluate } from "./evaluate.ts"
import type { Finding } from "./evaluate.ts"
import { readInstalled } from "./lockfiles.ts"
import type { Installed } from "./lockfiles.ts"

export const CONFIG = ".github/dependabot.yml"

/** Check every ignore rule in the repository's dependabot.yml. */
export async function audit(repoRoot: string): Promise<Finding[]> {
  const findings: Finding[] = []

  for (const block of await loadConfig(path.join(repoRoot, CONFIG))) {
    if (block.ignore.length === 0) continue

    if (!(block.ecosystem in MANIFESTS)) {
      findings.push({
        kind: "unchecked",
        line: block.line,
        message: `no lockfile reader for ${block.ecosystem}, so this block is not checked`,
      })
      continue
    }

    // A directory the block names but that cannot be read fails the check: a
    // warning would let a renamed directory or a new lockfile format turn every
    // rule in the block unchecked while CI stays green.
    const installed = new Map<string, Installed>()
    let complete = true
    const unreadable = (message: string) => {
      complete = false
      findings.push({ kind: "unreadable", line: block.line, message })
    }

    for (const pattern of block.directories) {
      const dirs = await expand(repoRoot, pattern, block.ecosystem)
      if (dirs.length === 0) unreadable(`${pattern} matches no directory`)

      for (const dir of dirs) {
        try {
          installed.set(dir, await readInstalled(path.join(repoRoot, dir), block.ecosystem))
        } catch (error) {
          unreadable(`cannot read ${dir}: ${error instanceof Error ? error.message : error}`)
        }
      }
    }

    findings.push(...evaluate(block, installed, complete))
  }

  return findings
}

const MANIFESTS: Record<string, string> = { npm: "package.json", composer: "composer.json" }

/**
 * Dependabot directories are repo-root-relative, and `directories` may hold
 * globs. Like Dependabot, a glob only yields directories that hold a manifest:
 * a stray file or leftover folder must not make the block look incomplete.
 */
async function expand(repoRoot: string, pattern: string, ecosystem: string): Promise<string[]> {
  const relative = pattern.replace(/^\/+/, "") || "."
  if (!/[*?[{]/.test(relative)) {
    return existsSync(path.join(repoRoot, relative)) ? [relative] : []
  }

  const manifest = MANIFESTS[ecosystem]
  const dirs: string[] = []
  for await (const entry of glob(relative, { cwd: repoRoot, withFileTypes: true })) {
    const dir = path.relative(repoRoot, path.join(entry.parentPath, entry.name))
    if (entry.isDirectory() && (!manifest || existsSync(path.join(repoRoot, dir, manifest)))) {
      dirs.push(dir)
    }
  }
  return dirs.sort()
}
