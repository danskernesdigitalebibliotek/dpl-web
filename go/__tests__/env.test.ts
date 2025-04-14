import { beforeEach, expect, test } from "vitest"

import { getEnv, getServerEnv } from "@/lib/config/env"

import { testSilently } from "./helpers"

beforeEach(() => {
  vi.unstubAllEnvs()
})

test("That the env variable APP_URL defines the current app url", async () => {
  vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://hellboy.the-movie.com")
  const appUrl = getEnv("APP_URL")

  expect(appUrl).toBe("https://hellboy.the-movie.com")
})

// test that we validate incorrect urls
// runs silently to avoid expected errors in the console
testSilently("That the env variable APP_URL validates the url", async () => {
  // set the env variable to a non-url value
  vi.stubEnv("NEXT_PUBLIC_APP_URL", "not-a-url")

  expect(() => getEnv("APP_URL")).toThrow()
})

// test that we validate incorrect env length
// runs silently to avoid expected errors in the console
testSilently("That the env variable GO_SESSION_SECRET validates the length", async () => {
  vi.stubEnv("GO_SESSION_SECRET", "not-very-long")

  expect(() => getServerEnv("GO_SESSION_SECRET")).toThrow()
})

// test that optional env variables can be undefined
test("That optional env variables can be undefined", async () => {
  vi.stubEnv("UNILOGIN_CLIENT_SECRET", undefined)
  const uniLoginClientId = getServerEnv("UNILOGIN_CLIENT_SECRET")

  expect(uniLoginClientId).toBeUndefined()
})
