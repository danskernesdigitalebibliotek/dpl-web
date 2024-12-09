import { renderHook, waitFor } from "@testing-library/react"
import { describe } from "node:test"
import { expect, test } from "vitest"

import MissingConfigurationError from "@/lib/config/errors/MissingConfigurationError"
import goConfig from "@/lib/config/goConfig"
import useGoConfig from "@/lib/config/useGoConfig"

describe("Config test suite", () => {
  test("That an error is thrown if we ask for unknown config", async () => {
    // @ts-ignore
    expect(() => goConfig("unknown.thingy")).toThrowError(MissingConfigurationError)
  })

  test("That the env variable NEXT_PUBLIC_APP_URL defines the current app url", async () => {
    const appUrl = goConfig("app.url")
    expect(appUrl).toBe("https://hellboy.the-movie.com")
  })

  test("That the client hook returns configuration as expected", async () => {
    const { result } = renderHook(() =>
      useGoConfig(["service.unilogin.wellknown.url", "search.item.limit"])
    )

    await waitFor(() => {})
    expect(result.current).toEqual({
      "search.item.limit": 12,
      "service.unilogin.wellknown.url": "https://hi-i-am-well-known-url.com",
    })
  })
})
