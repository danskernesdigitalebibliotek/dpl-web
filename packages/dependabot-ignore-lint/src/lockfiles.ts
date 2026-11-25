import { readFile } from "node:fs/promises"
import path from "node:path"
import { parse } from "yaml"

/** Direct dependencies of one directory: package name -> version as locked. */
export type Installed = Map<string, string>

/**
 * Read the direct dependencies locked in `dir`. Only the lockfile in the
 * directory itself counts: the workspace keeps one per package
 * (sharedWorkspaceLockfile: false), which is also what Dependabot reads.
 * Throws with the reason when the directory cannot be read.
 */
export async function readInstalled(dir: string, ecosystem: string): Promise<Installed> {
  switch (ecosystem) {
    case "npm":
      return readPnpmLock(dir)
    case "composer":
      return readComposerLock(dir)
    default:
      throw new Error(`no lockfile reader for ${ecosystem}`)
  }
}

interface PnpmImporter {
  dependencies?: Record<string, { version: string }>
  devDependencies?: Record<string, { version: string }>
  optionalDependencies?: Record<string, { version: string }>
}

async function readPnpmLock(dir: string): Promise<Installed> {
  const lock = parse(await readText(dir, "pnpm-lock.yaml")) as {
    importers?: Record<string, PnpmImporter>
  }
  const importer = lock.importers?.["."]
  if (!importer) throw new Error("pnpm-lock.yaml has no importer for its own directory")

  const installed: Installed = new Map()
  for (const group of [
    importer.dependencies,
    importer.devDependencies,
    importer.optionalDependencies,
  ]) {
    for (const [name, { version }] of Object.entries(group ?? {})) {
      // Drop the peer suffix: "9.1.2(react@18.3.1)" -> "9.1.2".
      installed.set(name, version.replace(/\(.*$/, ""))
    }
  }
  return installed
}

interface ComposerPackage {
  name: string
  version: string
}

/**
 * composer.lock lists transitive packages too. Dependabot only opens version
 * updates for what composer.json requires, so that is what counts here.
 */
async function readComposerLock(dir: string): Promise<Installed> {
  const lock = JSON.parse(await readText(dir, "composer.lock")) as {
    packages?: ComposerPackage[]
    "packages-dev"?: ComposerPackage[]
  }
  const manifest = JSON.parse(await readText(dir, "composer.json")) as {
    require?: Record<string, string>
    "require-dev"?: Record<string, string>
  }
  const direct = new Set(Object.keys({ ...manifest.require, ...manifest["require-dev"] }))

  const installed: Installed = new Map()
  for (const { name, version } of [...(lock.packages ?? []), ...(lock["packages-dev"] ?? [])]) {
    if (direct.has(name)) installed.set(name, version)
  }
  return installed
}

async function readText(dir: string, file: string): Promise<string> {
  try {
    return await readFile(path.join(dir, file), "utf8")
  } catch {
    throw new Error(`no ${file}`)
  }
}
