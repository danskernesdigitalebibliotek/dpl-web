import assert from "node:assert/strict"
import { describe, test } from "node:test"

import type { IgnoreRule } from "./config.ts"
import { evaluate, matchesName, toRange } from "./evaluate.ts"

const run = (
  ignore: Omit<IgnoreRule, "line">[],
  dirs: Record<string, Record<string, string>>,
  { complete = true, ecosystem = "npm" } = {}
) =>
  evaluate(
    {
      ecosystem,
      directories: Object.keys(dirs),
      line: 1,
      ignore: ignore.map(r => ({ ...r, line: 2 })),
    },
    new Map(Object.entries(dirs).map(([dir, pkgs]) => [dir, new Map(Object.entries(pkgs))])),
    complete
  )
const kinds = (...args: Parameters<typeof run>) => run(...args).map(f => f.kind)

describe("evaluate", () => {
  test("reports a rule the locked version already satisfies", () => {
    assert.deepEqual(kinds([{ name: "a", versions: [">=1"] }], { x: { a: "2.0.0" } }), ["stale"])
  })

  test("says nothing about a rule that still holds its package back", () => {
    assert.deepEqual(kinds([{ name: "a", versions: [">=3"] }], { x: { a: "2.0.0" } }), [])
  })

  test("never compares an update-types rule", () => {
    assert.deepEqual(kinds([{ name: "a", versions: [] }], { x: { a: "2.0.0" } }), [])
  })

  test("reports each stale match of a wildcard, since the rule still holds the rest back", () => {
    const findings = run([{ name: "@s/*", versions: [">=10"] }], {
      x: { "@s/one": "10.0.2", "@s/two": "9.1.0" },
    })
    assert.deepEqual(
      findings.map(f => f.message),
      ["@s/one in x is locked at 10.0.2, inside the ignored range >=10 (rule @s/*)"]
    )
  })

  test("calls a rule dead only when no directory of the block matches it", () => {
    const dirs = { one: { a: "1.0.0" }, two: { b: "1.0.0" } }
    assert.deepEqual(kinds([{ name: "a", versions: [">=9"] }], dirs), [])
    assert.deepEqual(kinds([{ name: "c", versions: [">=9"] }], dirs), ["dead"])
  })

  test("calls nothing dead in a block whose directories were not all read", () => {
    assert.deepEqual(
      kinds([{ name: "c", versions: [">=9"] }], { one: { a: "1.0.0" } }, { complete: false }),
      []
    )
  })

  test("leaves unreadable ranges and versions unchecked", () => {
    assert.deepEqual(
      kinds(
        [
          { name: "a", versions: ["~3.0"] },
          { name: "b", versions: [">=1"] },
        ],
        { x: { a: "3.5.0", b: "dev-main" } },
        { ecosystem: "composer" }
      ),
      ["unchecked", "unchecked"]
    )
  })
})

describe("matchesName", () => {
  for (const [pattern, name, expected] of [
    ["@storybook/*", "@storybook/addon-designs", true],
    ["@storybook/*", "storybook", false],
    ["drupal/core*", "drupal/core", true],
    ["drupal/core*", "drupal/facets", false],
    // Dependabot's `*` is not a path glob: it crosses `/`.
    ["*", "@storybook/react", true],
    ["Cypress", "cypress", true],
    // Only `*` is special.
    ["foo?", "fooa", false],
  ] as const) {
    test(`${pattern} ${expected ? "matches" : "does not match"} ${name}`, () => {
      assert.equal(matchesName(pattern, name), expected)
    })
  }
})

describe("toRange", () => {
  test("ORs the entries of versions", () => {
    assert.equal(toRange(["<2", ">=3"], "npm"), "<2 || >=3")
  })

  test("refuses Composer syntax node-semver would read differently", () => {
    // ~3.0 is <4.0.0 to Composer but <3.1.0 to node-semver.
    assert.equal(toRange(["~3.0"], "composer"), null)
    assert.equal(toRange([">=1.0,<2.0"], "composer"), null)
    assert.equal(toRange(["^1.0@dev"], "composer"), null)
    assert.equal(toRange([">=1.13.0"], "composer"), ">=1.13.0")
  })
})
