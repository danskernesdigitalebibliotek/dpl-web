import { fileURLToPath } from "node:url"

import { CONFIG, audit } from "./audit.ts"
import type { Finding } from "./evaluate.ts"

const repoRoot = process.argv[2] ?? fileURLToPath(new URL("../../..", import.meta.url))

let findings: Finding[]
try {
  findings = (await audit(repoRoot)).sort((a, b) => a.line - b.line)
} catch (error) {
  // A config the lint cannot read is reported like any other finding, so it
  // also becomes an annotation rather than a bare stack trace.
  findings = [{ kind: "unreadable", line: 1, message: String(error) }]
}

for (const { kind, line, message } of findings) {
  const level = kind === "unchecked" ? "warning" : "error"
  // In Actions, workflow commands become annotations on dependabot.yml. Their
  // message ends at the first raw newline, so escape it as the format asks.
  const escaped = message.replace(/%/g, "%25").replace(/\r/g, "%0D").replace(/\n/g, "%0A")
  console.log(
    process.env.GITHUB_ACTIONS
      ? `::${level} file=${CONFIG},line=${line},title=Dependabot ignore lint: ${kind}::${escaped}`
      : `${CONFIG}:${line}: ${kind}: ${message}`
  )
}

const failing = findings.filter(f => f.kind !== "unchecked").length
console.log(
  failing
    ? `\n${failing} problem(s) with the ignore rules in ${CONFIG}.`
    : `No stale ignore rules in ${CONFIG}.`
)
// Not process.exit: that can cut off output still queued for a pipe.
process.exitCode = failing ? 1 : 0
