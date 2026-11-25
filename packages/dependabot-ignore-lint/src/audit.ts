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
      const dirs = await expand(repoRoot, pattern)
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

/** Dependabot directories are repo-root-relative, and `directories` may hold globs. */
async function expand(repoRoot: string, pattern: string): Promise<string[]> {
  const relative = pattern.replace(/^\/+/, "") || "."
  if (!relative.includes("*")) return existsSync(path.join(repoRoot, relative)) ? [relative] : []
  return Array.fromAsync(glob(relative, { cwd: repoRoot }))
}
