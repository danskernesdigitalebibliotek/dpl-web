import path from "node:path"

import { loadConfig } from "./config.ts"
import { expandDirectories, findLockfile } from "./directories.ts"
import { evaluate } from "./evaluate.ts"
import { readInstalled } from "./lockfiles/index.ts"
import type { AuditResult, Installed, ResolvedBlock, UpdateBlock } from "./types.ts"

export interface AuditOptions {
  repoRoot: string
  /** Relative to repoRoot. */
  configPath?: string
}

/**
 * Read dependabot.yml, resolve every block's directories against the working
 * tree, and compare each ignore entry with what is installed there. The
 * comparison itself lives in evaluate.ts; this is the half that touches disk.
 */
export async function audit({
  repoRoot,
  configPath = ".github/dependabot.yml",
}: AuditOptions): Promise<AuditResult> {
  const absConfig = path.resolve(repoRoot, configPath)
  const blocks = await loadConfig(absConfig)
  const resolved = await resolve(repoRoot, blocks)

  return { ...evaluate(resolved), configPath: path.relative(repoRoot, absConfig) }
}

/** Expand each block's directories and read the lockfile governing each one. */
async function resolve(repoRoot: string, blocks: UpdateBlock[]): Promise<ResolvedBlock[]> {
  const resolved: ResolvedBlock[] = []

  for (const block of blocks) {
    if (block.ignore.length === 0) continue
    const { dirs, missing } = await expandDirectories(repoRoot, block.directories)
    const audited = new Map<string, Installed>()
    const skipped = missing.map(pattern => ({
      dir: pattern,
      reason: "no such directory in the repository, so its rules were not audited",
    }))

    for (const dir of dirs) {
      const lock = findLockfile(repoRoot, dir, block.ecosystem)
      if (!lock) {
        skipped.push({ dir, reason: `no supported lockfile for ${block.ecosystem}` })
        continue
      }
      try {
        audited.set(dir, await readInstalled(lock))
      } catch (error) {
        const reason = error instanceof Error ? error.message : String(error)
        skipped.push({
          dir,
          reason: `cannot read ${path.relative(repoRoot, lock.file)}: ${reason}`,
        })
      }
    }

    resolved.push({ block, audited, skipped })
  }

  return resolved
}
