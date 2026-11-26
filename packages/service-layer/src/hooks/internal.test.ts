import { describe, expect, it } from "vitest"

import type { ServiceLayerConfig } from "../types"
import { canUseDigitalLoans } from "./internal"

const config: ServiceLayerConfig = {
  getBaseUrl: () => "https://biblio.example",
  getAuthHeader: () => "Bearer abc",
}

describe("canUseDigitalLoans", () => {
  it("follows the digital flag when it is set", () => {
    expect(canUseDigitalLoans({ ...config, canUseDigitalLoans: false })).toBe(false)
    expect(
      canUseDigitalLoans({ ...config, canUseDigitalLoans: true, isPatronAuthenticated: false })
    ).toBe(true)
  })

  it("falls back to the patron flag when the digital one is unset", () => {
    expect(canUseDigitalLoans({ ...config, isPatronAuthenticated: false })).toBe(false)
  })

  it("allows the calls when neither flag is set", () => {
    expect(canUseDigitalLoans(config)).toBe(true)
  })
})
