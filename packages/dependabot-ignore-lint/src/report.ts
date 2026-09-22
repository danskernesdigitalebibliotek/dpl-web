import type { AuditResult, Finding, FindingKind } from "./types.ts"

const ORDER: FindingKind[] = ["stale", "partial", "dead", "unparseable", "skipped"]
export const FAILING = new Set<FindingKind>(["stale", "partial", "dead"])

export interface ReportOptions {
  /** Emit GitHub Actions workflow commands so findings annotate dependabot.yml. */
  annotate?: boolean
}

/** Human-readable table on stdout; returns the process exit code. */
export function report(
  { findings, comparisons, configPath }: AuditResult,
  { annotate = Boolean(process.env.GITHUB_ACTIONS) }: ReportOptions = {}
): number {
  const sorted = [...findings].sort(
    (a, b) =>
      ORDER.indexOf(a.kind) - ORDER.indexOf(b.kind) || (a.configLine ?? 0) - (b.configLine ?? 0)
  )

  if (sorted.length === 0) {
    console.log(`✔ ${comparisons} version-scoped ignore(s) checked, nothing stale.`)
    return 0
  }

  // Skipped when annotating: every row is emitted again just below as a
  // workflow command, and GitHub renders those into the log itself.
  if (!annotate)
    console.table(
      sorted.map(f => ({
        kind: f.kind,
        line: f.configLine ?? "",
        directory: f.dir,
        dependency: f.dependencyName ?? "",
        installed: f.installedVersion ?? "",
        detail: f.detail,
      }))
    )

  if (annotate) for (const f of sorted) console.log(annotation(f, configPath))

  const count = (kind: FindingKind) => sorted.filter(f => f.kind === kind).length
  const stale = count("stale")
  const partial = count("partial")
  const dead = count("dead")
  const failing = stale + partial + dead
  console.log(
    `\n${comparisons} version-scoped ignore(s) checked: ${stale} stale, ${partial} over-reaching, ` +
      `${dead} dead, ${sorted.length - failing} other finding(s).`
  )
  return failing > 0 ? 1 : 0
}

function annotation(f: Finding, configPath: string): string {
  // error for what fails the build, warning for what the audit could not judge
  // - a directory it never read proves nothing about the rules pointing at it.
  const level = FAILING.has(f.kind) ? "error" : "warning"
  const loc = f.configLine ? `file=${configPath},line=${f.configLine}` : `file=${configPath}`
  // The line is repeated in the message because GitHub keeps only ten
  // annotations per level, while every rendered command stays in the log.
  const at = f.configLine ? `${configPath}:${f.configLine}` : configPath
  return `::${level} ${loc},title=dependabot ignore ${f.kind}::${at} ${f.dir}: ${f.dependencyName ?? ""} ${f.detail}`
}
