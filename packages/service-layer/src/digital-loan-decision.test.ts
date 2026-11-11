import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { getDigitalLoanDecision, isMaterialAvailable } from "./digital-loan-decision"
import { mockJsonResponse } from "./test-utils"
import type { ServiceLayerConfig } from "./types"

const config: ServiceLayerConfig = {
  getBaseUrl: () => "https://biblio.example",
  getAuthHeader: () => "Bearer abc",
}

describe("getDigitalLoanDecision", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn())
    vi.spyOn(console, "error").mockImplementation(() => {})
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it("Logs a failed decision and still fails", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(mockJsonResponse({}, 404))

    await expect(getDigitalLoanDecision(config, "9788758855752")).rejects.toThrow("404")
    expect(console.error).toHaveBeenCalledWith("Biblio loan decision failed", expect.any(Error))
  })
})

describe("isMaterialAvailable", () => {
  it("Treats a loanable material as available", () => {
    expect(isMaterialAvailable("loanable")).toBe(true)
  })

  it.each(["reservable", "wishable", "unavailable"] as const)(
    "Treats a material that can only be %s as unavailable",
    status => {
      expect(isMaterialAvailable(status)).toBe(false)
    }
  )

  it.each([
    "monthly_limit_exceeded",
    "concurrent_limit_exceeded",
    "no_valid_credentials",
    "lending_blocked",
  ] as const)(
    "Keeps the material available when %s describes the user, not the material",
    status => {
      expect(isMaterialAvailable(status)).toBe(true)
    }
  )

  it("Does not promise a material available on a status it does not know", () => {
    expect(isMaterialAvailable("brand-new-status")).toBe(false)
  })
})
