import { describe, expect, test } from "vitest"

import { findMatchingRoute } from "../scripts/prepare-docker-env-vars.mjs"

describe("findMatchingRoute", () => {
  const routes = [
    "https://varnish.main.dpl-cms.dplplat02.dpl.reload.dk",
    "https://go.main.dpl-cms.dplplat02.dpl.reload.dk",
    "https://node.main.dpl-cms.dplplat02.dpl.reload.dk",
  ]

  test("returns the first route matching the highest-priority prefix", () => {
    const result = findMatchingRoute(routes, ["https://go.", "https://www.go.", "https://node."])
    expect(result).toBe("https://go.main.dpl-cms.dplplat02.dpl.reload.dk")
  })

  test("falls back to a lower-priority prefix if higher ones don't match", () => {
    const routesWithoutGo = [
      "https://varnish.main.dpl-cms.dplplat02.dpl.reload.dk",
      "https://node.main.dpl-cms.dplplat02.dpl.reload.dk",
    ]
    const result = findMatchingRoute(routesWithoutGo, [
      "https://go.",
      "https://www.go.",
      "https://node.",
    ])
    expect(result).toBe("https://node.main.dpl-cms.dplplat02.dpl.reload.dk")
  })

  test("returns undefined when no route matches any prefix", () => {
    const result = findMatchingRoute(routes, ["https://unknown."])
    expect(result).toBeUndefined()
  })

  test("returns undefined for empty routes", () => {
    const result = findMatchingRoute([], ["https://go."])
    expect(result).toBeUndefined()
  })

  test("returns undefined for empty prefixes", () => {
    const result = findMatchingRoute(routes, [])
    expect(result).toBeUndefined()
  })

  test("prefers earlier prefix over earlier route", () => {
    const routesNodeFirst = ["https://node.example.com", "https://go.example.com"]
    const result = findMatchingRoute(routesNodeFirst, ["https://go.", "https://node."])
    expect(result).toBe("https://go.example.com")
  })
})
