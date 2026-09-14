import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { getDigitalMaterialHolding } from "./digital-loans"
import { mockJsonResponse } from "./test-utils"
import type { ServiceLayerConfig } from "./types"

const config: ServiceLayerConfig = {
  getBaseUrl: service => (service === "biblio" ? "https://biblio.example" : "https://fbi.example"),
  getAuthHeader: () => "Bearer abc",
}

// A loan as the adapter lends it: complete, since the mapper rejects a
// partial record.
const providerLoan = (materialId: string, title: string) => ({
  id: `loan-${materialId}`,
  material_id: materialId,
  material_type: "ebook",
  start: "2026-06-01T00:00:00.000Z",
  end: "2026-06-29T00:00:00.000Z",
  active: true,
  title,
  author: "Sherman, L.",
  publisher: "Lindhardt og Ringhof",
  publish_date: "2026-06-18T00:00:00.000Z",
  license: { type: "selection" },
})

const givenProviderLends = (...loans: ReturnType<typeof providerLoan>[]) =>
  vi.mocked(fetch).mockResolvedValueOnce(mockJsonResponse({ loans, pagination: {} }))

describe("getDigitalMaterialHolding", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("answers with the loan the patron holds on this material", async () => {
    givenProviderLends(
      providerLoan("9788711234567", "The WITCHER 5"),
      providerLoan("9788758859668", "FC Forza #8: Bo går i panik")
    )

    expect(await getDigitalMaterialHolding(config, "9788758859668")).toMatchObject({
      loanId: "loan-9788758859668",
      materialId: "9788758859668",
    })
  })

  // Null rather than undefined: react-query rejects a query function that
  // resolves to undefined, and this one backs a query.
  it("answers with null when no loan is for this material", async () => {
    givenProviderLends(providerLoan("9788711234567", "The WITCHER 5"))

    expect(await getDigitalMaterialHolding(config, "9788758859668")).toBeNull()
  })

  // The material page has the material on screen already and uses the answer
  // for its id, so making it wait on a catalogue search would only delay the
  // borrow button - see ADR-004.
  it("does not search the catalogue", async () => {
    givenProviderLends(providerLoan("9788758859668", "FC Forza #8: Bo går i panik"))

    const loan = await getDigitalMaterialHolding(config, "9788758859668")

    expect(fetch).toHaveBeenCalledTimes(1)
    expect(loan?.title).toBe("FC Forza #8: Bo går i panik")
  })
})
