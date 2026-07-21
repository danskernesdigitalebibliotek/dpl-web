import { describe, expect, test } from "vitest"

import MissingConfigurationError from "@/lib/config/errors/MissingConfigurationError"
import goConfig from "@/lib/config/goConfig"

describe("Config test suite", () => {
  test("That an error is thrown if we ask for unknown config", async () => {
    // @ts-ignore
    expect(() => goConfig("unknown.thingy")).toThrowError(MissingConfigurationError)
  })

  test("That configuration values resolve synchronously", async () => {
    expect(goConfig("search.item.limit")).toBe(12)
  })
})
