import { readFile } from "node:fs/promises"
import { LineCounter, isMap, isSeq, parseDocument } from "yaml"
import type { Node } from "yaml"

import type { IgnoreEntry, UpdateBlock } from "./types.ts"

/**
 * Load dependabot.yml and return its `updates` blocks, each with its ignore
 * entries annotated with the 1-based line they start on.
 *
 * `parseDocument` rather than `parse` on purpose: the document model keeps node
 * ranges (and comments), which is what lets a finding say
 * ".github/dependabot.yml:317" and would let a future auto-fix remove an entry
 * without disturbing the comments around it.
 */
export async function loadConfig(path: string): Promise<UpdateBlock[]> {
  return parseConfig(await readFile(path, "utf8"), path)
}

/** The parsing half of {@link loadConfig}; `path` only names the file in errors. */
export function parseConfig(text: string, path: string): UpdateBlock[] {
  const lineCounter = new LineCounter()
  const doc = parseDocument(text, { lineCounter, keepSourceTokens: true })

  if (doc.errors.length) {
    throw new Error(`${path}: YAML parse error\n${doc.errors.map(e => e.message).join("\n")}`)
  }

  const root = doc.contents
  if (!isMap(root) || root.get("version", true)?.toJSON() !== 2) {
    throw new Error(`${path}: expected a Dependabot v2 config (version: 2)`)
  }
  const updates = root.get("updates")
  if (!isSeq(updates)) throw new Error(`${path}: 'updates' must be a list`)

  const lineOf = (node: Node): number | undefined =>
    node.range ? lineCounter.linePos(node.range[0]).line : undefined

  return updates.items.map(blockNode => {
    if (!isMap(blockNode)) throw new Error(`${path}: an updates entry is not a mapping`)
    const block = blockNode.toJSON() as Record<string, unknown>
    const ignoreSeq = blockNode.get("ignore")
    const ignore: IgnoreEntry[] = isSeq(ignoreSeq)
      ? ignoreSeq.items.map(n => {
          const entry = (n as Node).toJSON() as IgnoreEntry
          // The schema allows `versions` as a bare string as well as a list.
          const versions = entry.versions
          return {
            ...entry,
            versions: versions === undefined || Array.isArray(versions) ? versions : [versions],
            line: lineOf(n as Node),
          }
        })
      : []

    const directories = Array.isArray(block.directories)
      ? (block.directories as string[])
      : [typeof block.directory === "string" ? block.directory : "/"]

    return {
      line: lineOf(blockNode),
      ecosystem: String(block["package-ecosystem"]),
      directories,
      ignore,
    }
  })
}

if (import.meta.vitest) {
  const { describe, expect, it } = import.meta.vitest

  const config = `version: 2
updates:
  - package-ecosystem: npm
    directory: "/one"
    ignore:
      - dependency-name: "listed"
        versions: [">=1"]
      - dependency-name: "scalar"
        versions: ">=2"
  - package-ecosystem: composer
    directories: ["/many/*", "/other"]
    ignore:
      - dependency-name: "majors"
        update-types: ["version-update:semver-major"]
`

  describe("parseConfig", () => {
    it("reads each update block with its ecosystem and directories", () => {
      const blocks = parseConfig(config, "dependabot.yml")

      expect(blocks.map(b => [b.ecosystem, b.directories])).toEqual([
        ["npm", ["/one"]],
        ["composer", ["/many/*", "/other"]],
      ])
    })

    it("reads a scalar versions as the one-element list the schema allows", () => {
      const [first] = parseConfig(config, "dependabot.yml")

      expect(first?.ignore.map(e => e.versions)).toEqual([[">=1"], [">=2"]])
    })

    it("records the line each ignore entry starts on", () => {
      const [first] = parseConfig(config, "dependabot.yml")

      expect(first?.ignore.map(e => e.line)).toEqual([6, 8])
    })

    it("rejects anything that is not a Dependabot v2 config", () => {
      expect(() => parseConfig("version: 1\nupdates: []\n", "dependabot.yml")).toThrow("v2")
      expect(() => parseConfig("version: 2\nupdates: {}\n", "dependabot.yml")).toThrow(
        "must be a list"
      )
    })
  })
}
