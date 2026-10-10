import type { Installed, LockfileRef } from "../types.ts"
import { readComposerLock } from "./composer.ts"
import { readNpmLock } from "./npm.ts"
import { readPnpmLock } from "./pnpm.ts"

/** Direct dependencies of one directory, from whichever lockfile governs it. */
export async function readInstalled({ file, kind, importer }: LockfileRef): Promise<Installed> {
  switch (kind) {
    case "pnpm-lock.yaml":
      return readPnpmLock(file, importer)
    case "package-lock.json":
    case "npm-shrinkwrap.json":
      return readNpmLock(file, importer)
    case "composer.lock":
      return readComposerLock(file, importer)
    default:
      throw new Error(`unknown lockfile kind ${kind}`)
  }
}
