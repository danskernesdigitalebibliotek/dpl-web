import { expect, test } from "vitest"

import { resolveUrl } from "../lib/helpers/helper.routes"

test("That resolveUrl can return a work url", async () => {
  const workUrl = resolveUrl({ type: "work", routeParams: { wid: 123 } })
  expect(workUrl).toBe("/work/123")
})

test("That resolveUrl can return a work url with a manifestation type", async () => {
  const workUrl = resolveUrl({
    type: "work",
    routeParams: { wid: 123 },
    queryParams: { audio: "true" },
  })
  expect(workUrl).toBe("/work/123?audio=true")
})

test("That resolveUrl can return a search url", async () => {
  const workUrl = resolveUrl({ type: "search", queryParams: { q: "test" } })
  expect(workUrl).toBe("/search?q=test")
})
