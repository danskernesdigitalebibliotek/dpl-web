import { expect, test } from "vitest"

import { getEnv } from "@/lib/config/env"

import { resolveUrl } from "../lib/helpers/helper.routes"

test("That resolveUrl can return a work url", async () => {
  const workUrl = resolveUrl({ routeParams: { work: "work", wid: 123 } })
  const appUrl = getEnv("APP_URL")
  expect(workUrl).toBe(`${appUrl}/work/123`)
})

test("That resolveUrl can return a work url with a manifestation type", async () => {
  const workUrl = resolveUrl({
    routeParams: { work: "work", wid: 123 },
    queryParams: { audio: "true" },
  })
  const appUrl = getEnv("APP_URL")
  expect(workUrl).toBe(`${appUrl}/work/123?audio=true`)
})

test("That resolveUrl can return a search url", async () => {
  const workUrl = resolveUrl({ routeParams: { search: "search" }, queryParams: { q: "test" } })
  const appUrl = getEnv("APP_URL")
  expect(workUrl).toBe(`${appUrl}/search?q=test`)
})
