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

    const installed = new Map<string, Installed>()
    let complete = true
    const unchecked = (message: string) => {
      complete = false
      findings.push({ kind: "unchecked", line: block.line, message })
    }

    for (const pattern of block.directories) {
      const dirs = await expand(repoRoot, pattern, block.ecosystem)
      if (dirs.length === 0) unchecked(`${pattern} matches no directory`)

      for (const dir of dirs) {
        try {
          installed.set(dir, await readInstalled(path.join(repoRoot, dir), block.ecosystem))
        } catch (error) {
          unchecked(`${dir} was not checked: ${error instanceof Error ? error.message : error}`)
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
