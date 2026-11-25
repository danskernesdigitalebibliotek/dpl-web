import { fileURLToPath } from "node:url"

import { CONFIG, audit } from "./audit.ts"

const repoRoot = process.argv[2] ?? fileURLToPath(new URL("../../..", import.meta.url))
const findings = (await audit(repoRoot)).sort((a, b) => a.line - b.line)

for (const { kind, line, message } of findings) {
  const level = kind === "unchecked" ? "warning" : "error"
  // In Actions, workflow commands become annotations on dependabot.yml.
  console.log(
    process.env.GITHUB_ACTIONS
      ? `::${level} file=${CONFIG},line=${line},title=${kind} ignore rule::${message}`
      : `${CONFIG}:${line}: ${kind}: ${message}`
  )
}

const failing = findings.filter(f => f.kind !== "unchecked").length
console.log(
  failing
    ? `\n${failing} ignore rule(s) in ${CONFIG} no longer hold anything back. Delete them, or split a wildcard rule.`
    : `No stale ignore rules in ${CONFIG}.`
)
// Not process.exit: that can cut off output still queued for a pipe.
process.exitCode = failing ? 1 : 0
