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

  test("treats a prerelease as below its release, as Dependabot does", () => {
    assert.deepEqual(kinds([{ name: "a", versions: [">=10"] }], { x: { a: "10.0.0-beta.1" } }), [])
  })

  test("never compares an update-types rule", () => {
    assert.deepEqual(kinds([{ name: "a", versions: [] }], { x: { a: "2.0.0" } }), [])
  })

  test("reports a rule whose range lies wholly below the locked version", () => {
    assert.deepEqual(kinds([{ name: "a", versions: ["<5", "4.x"] }], { x: { a: "6.2.0" } }), [
      "stale",
    ])
  })

  test("leaves alone a bounded range that only skips some later versions", () => {
    assert.deepEqual(kinds([{ name: "a", versions: ["6.1.x"] }], { x: { a: "6.1.0" } }), [])
    assert.deepEqual(kinds([{ name: "a", versions: [">=16 <16.3"] }], { x: { a: "16.2.1" } }), [])
  })

  test("leaves alone a rule pinning exactly the locked version", () => {
    assert.deepEqual(kinds([{ name: "a", versions: [">1.1.0"] }], { x: { a: "1.1.0" } }), [])
  })

  test("asks to delete or raise a rule that holds nothing back anywhere", () => {
    const [finding] = run([{ name: "a", versions: [">=18"] }], { x: { a: "18.3.1" } })
    assert.equal(
      finding?.message,
      "a 18.3.1 in x is inside >=18, so every update of it is ignored. " +
        "Delete the rule, or raise its lower bound above the locked version."
    )
  })

  test("asks to split a wildcard that still holds other packages back", () => {
    const [finding] = run([{ name: "@s/*", versions: [">=10"] }], {
      x: { "@s/one": "10.0.2", "@s/two": "9.1.0" },
    })
    assert.equal(
      finding?.message,
      "@s/*: @s/one 10.0.2 in x is inside >=10, so every update of it is ignored, " +
        "but it still holds back @s/two 9.1.0 in x. Split it so it no longer covers the former."
    )
  })

  test("asks to split a block where the rule still holds another directory back", () => {
    const [finding] = run([{ name: "a", versions: [">=6"] }], {
      one: { a: "6.0.0" },
      two: { a: "5.9.3" },
    })
    assert.match(finding?.message ?? "", /still holds back a 5\.9\.3 in two\. Split it/)
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

  test("refuses syntax Dependabot reads differently in any ecosystem", () => {
    assert.equal(toRange(["~> 9.0"], "npm"), null)
    assert.equal(toRange([">1.0"], "npm"), null)
    assert.equal(toRange(["<=2"], "npm"), null)
    assert.equal(
      toRange([">1.1.0", ">=10", "<5", "<=2.0.0"], "npm"),
      ">1.1.0 || >=10 || <5 || <=2.0.0"
    )
  })
})
