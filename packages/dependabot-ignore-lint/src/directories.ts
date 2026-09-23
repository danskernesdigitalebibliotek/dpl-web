import { existsSync } from "node:fs"
import { glob } from "node:fs/promises"
import path from "node:path"

import type { LockfileRef } from "./types.ts"

/** Lockfiles we know how to read, per ecosystem, in priority order. */
const LOCKFILES: Record<string, string[]> = {
  npm: ["pnpm-lock.yaml", "package-lock.json", "npm-shrinkwrap.json"],
  composer: ["composer.lock"],
}

/**
 * Dependabot directories are repo-root-relative and may contain globs when
 * given via `directories:`. Expand them to real directories on disk, and report
 * the patterns that matched nothing so a renamed or mistyped directory cannot
 * take its block's rules out of the audit unnoticed.
 */
export async function expandDirectories(
  repoRoot: string,
  patterns: string[]
): Promise<{ dirs: string[]; missing: string[] }> {
  const out = new Set<string>()
  const missing: string[] = []
  for (const pattern of patterns) {
    const before = out.size
    const rel = pattern.replace(/^\/+/, "") || "."
    if (!/[*?{[]/.test(rel)) {
      if (existsSync(path.join(repoRoot, rel))) out.add(rel)
      else missing.push(pattern)
      continue
    }
    for await (const found of glob(rel, {
      cwd: repoRoot,
      withFileTypes: true,
      exclude: d => d.name === "node_modules" || d.name === "vendor",
    })) {
      if (found.isDirectory()) {
        out.add(path.relative(repoRoot, path.join(found.parentPath, found.name)))
      }
    }
    if (out.size === before) missing.push(pattern)
  }
  return { dirs: [...out].sort(), missing }
}

/**
 * Walk up from `dir` towards the repo root looking for a lockfile. Workspaces
 * with a shared lockfile keep it at the workspace root with a per-package
 * `importers` section, so the nearest lockfile may be in a parent. Returns the
 * lockfile plus the directory's path relative to it, which is exactly the
 * `importers` key pnpm uses.
 */
export function findLockfile(repoRoot: string, dir: string, ecosystem: string): LockfileRef | null {
  const candidates = LOCKFILES[ecosystem]
  if (!candidates) return null

  const target = path.resolve(repoRoot, dir)
  const root = path.resolve(repoRoot)
  let current = target
  for (;;) {
    for (const name of candidates) {
      const file = path.join(current, name)
      if (existsSync(file)) {
        return { file, kind: name, importer: path.relative(current, target) || "." }
      }
    }
    if (current === root) return null
    current = path.dirname(current)
  }
}
