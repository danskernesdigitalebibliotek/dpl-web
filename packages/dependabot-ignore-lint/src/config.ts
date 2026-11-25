import { readFile } from "node:fs/promises"
import { LineCounter, isMap, isSeq, parseDocument } from "yaml"
import type { Node } from "yaml"

export interface IgnoreRule {
  name?: string
  versions: string[]
  line: number
}

export interface UpdateBlock {
  ecosystem: string
  /** `directory` or `directories`, as written: repo-root-relative, globs allowed. */
  directories: string[]
  ignore: IgnoreRule[]
  line: number
}

/**
 * The `updates` blocks of dependabot.yml. Read through the YAML document model
 * rather than as plain data so every rule keeps the line it starts on, which is
 * where a finding points.
 */
export async function loadConfig(file: string): Promise<UpdateBlock[]> {
  const lineCounter = new LineCounter()
  const doc = parseDocument(await readFile(file, "utf8"), { lineCounter })
  if (doc.errors.length) throw doc.errors[0]

  const updates = doc.get("updates")
  if (!isSeq(updates)) throw new Error(`${file}: 'updates' must be a list`)

  const lineOf = (node: Node) => lineCounter.linePos(node.range?.[0] ?? 0).line

  return updates.items.filter(isMap).map(block => {
    const json = block.toJSON() as Record<string, unknown>
    const ignore = block.get("ignore")
    return {
      ecosystem: String(json["package-ecosystem"]),
      directories: [json.directories ?? json.directory ?? "/"].flat().map(String),
      line: lineOf(block),
      ignore: isSeq(ignore)
        ? ignore.items.filter(isMap).map(rule => {
            const { "dependency-name": name, versions } = rule.toJSON() as Record<string, unknown>
            return {
              name: typeof name === "string" ? name : undefined,
              // The schema allows a bare string as well as a list.
              versions: versions === undefined ? [] : [versions].flat().map(String),
              line: lineOf(rule),
            }
          })
        : [],
    }
  })
}
