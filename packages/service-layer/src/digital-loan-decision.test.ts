import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import {
  getDigitalLoanDecision,
  isMaterialAvailable,
  isUnknownMaterial,
} from "./digital-loan-decision"
import { mockJsonResponse } from "./test-utils"
import type { ServiceLayerConfig } from "./types"

const configThat = (tolerateUnknownMaterials?: () => boolean): ServiceLayerConfig => ({
  getBaseUrl: () => "https://biblio.example",
  getAuthHeader: () => "Bearer abc",
  tolerateUnknownMaterials,
})

const notFound = () => mockJsonResponse({ message: "Material not found: 9788758855752" }, 404)

// TEMPORARY, with the toleration setting it covers.
describe("getDigitalLoanDecision for a material the adapter does not know", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("Answers an unavailable material when the host tolerates it", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(notFound())

    const decision = await getDigitalLoanDecision(
      configThat(() => true),
      "9788758855752"
    )

    // An ordinary decision: nothing downstream has to know about the 404.
    expect(isMaterialAvailable(decision.status)).toBe(false)
    // Only the sample offer needs to tell it apart from a reserved-out one.
    expect(isUnknownMaterial(decision)).toBe(true)
  })

  it("Fails when the host does not tolerate it", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(notFound())

    await expect(
      getDigitalLoanDecision(
        configThat(() => false),
        "9788758855752"
      )
    ).rejects.toThrow("404")
  })

  it("Fails when the host has no say on it", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(notFound())

    await expect(getDigitalLoanDecision(configThat(), "9788758855752")).rejects.toThrow("404")
  })
})

describe("isUnknownMaterial", () => {
  it("Does not mistake a material the adapter knows for an unknown one", () => {
    expect(isUnknownMaterial({ status: "unavailable" })).toBe(false)
    expect(isUnknownMaterial({ status: "reservable" })).toBe(false)
  })

  it("Holds off while there is no answer yet", () => {
    expect(isUnknownMaterial(undefined)).toBe(false)
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
})
