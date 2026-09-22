/** One entry of a block's `ignore:` list, in dependabot.yml's own shape. */
export interface IgnoreEntry {
  /** Absent is legal: the schema allows an entry carrying only versions or update-types. */
  "dependency-name"?: string
  /** Numbers because unquoted YAML parses as such; a scalar is widened to one element. */
  versions?: (string | number)[]
  /** Scoped this way an entry blocks majors only, so it cannot go stale and is never checked. */
  "update-types"?: string[]
  /** 1-based line in dependabot.yml where this entry starts. */
  line?: number
}

/** One entry of `updates:`. */
export interface UpdateBlock {
  /** Where the block starts; findings about a directory point here rather than at a rule. */
  line?: number
  /** Dependabot's `package-ecosystem`. Chooses the candidate lockfiles, not the parser. */
  ecosystem: string
  /** `directory` and `directories` both land here: repo-root-relative, globs allowed. */
  directories: string[]
  ignore: IgnoreEntry[]
}

/** report.ts sorts by this order; stale, partial and dead fail the build. */
export type FindingKind = "stale" | "partial" | "dead" | "unparseable" | "skipped"

export interface Finding {
  kind: FindingKind
  /** The directory audited - every directory of the block for `dead`, or an unmatched pattern. */
  dir: string
  /** Line in dependabot.yml: the entry's, or the block's where no single entry is at fault. */
  configLine?: number
  /** The rule's dependency-name, or the package it matched. Absent when a directory is at fault. */
  dependencyName?: string
  /** Only on `stale`: the version that already satisfies the ignored range. */
  installedVersion?: string
  /** The entry's `versions:` as node-semver, after translation - not as written. */
  ignoredRange?: string
  /** One sentence, used for both the table row and the GitHub annotation body. */
  detail: string
}

export interface AuditResult {
  findings: Finding[]
  /** Number of (ignore entry, installed package) pairs that were compared. */
  comparisons: number
  /** Relative to the repo root, so annotations resolve against GITHUB_WORKSPACE. */
  configPath: string
}

/** The lockfile governing one audited directory. */
export interface LockfileRef {
  file: string
  /** The filename, not the ecosystem: one ecosystem can have several lockfile formats. */
  kind: string
  /** Path of the audited directory relative to the lockfile; pnpm's `importers` key. */
  importer: string
}

/** Direct dependencies of one directory: package name -> raw installed version. */
export type Installed = Map<string, string>

/** One update block with its directories resolved and their lockfiles read. */
export interface ResolvedBlock {
  block: UpdateBlock
  /** Directories that were audited, in order, with their direct dependencies. */
  audited: Map<string, Installed>
  /** Directories that were not, and why. */
  skipped: { dir: string; reason: string }[]
}
