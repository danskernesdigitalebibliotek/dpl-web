#!/usr/bin/env node
import { parseArgs } from "node:util"

import { audit } from "./audit.ts"
import { FAILING, report } from "./report.ts"

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    config: { type: "string", short: "c", default: ".github/dependabot.yml" },
    json: { type: "boolean", default: false },
    help: { type: "boolean", short: "h", default: false },
  },
})

// process.exit would discard whatever stdout still has queued: writes to a
// pipe are asynchronous, and CI always gives us a pipe. Set the code instead
// and let the process end when the output has drained.
if (values.help) {
  console.log(`usage: dependabot-ignore-lint [repo-root] [--config .github/dependabot.yml] [--json]

Finds ignore entries in dependabot.yml whose ignored version range the
installed version (from the lockfile) already satisfies. Exits 1 if any.`)
} else {
  const result = await audit({
    repoRoot: positionals[0] ?? process.cwd(),
    configPath: values.config,
  })

  if (values.json) {
    console.log(JSON.stringify(result, null, 2))
    process.exitCode = result.findings.some(f => FAILING.has(f.kind)) ? 1 : 0
  } else {
    process.exitCode = report(result)
  }
}
