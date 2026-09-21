import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { withCatalogueDetails, withCatalogueDetailsForRequest } from "./catalogue"
import { catalogueSearchResponse, catalogueWork, mockJsonResponse } from "./test-utils"
import type { ServiceLayerConfig } from "./types"

const config: ServiceLayerConfig = {
  getBaseUrl: () => "https://fbi.example/graphql",
  getAuthHeader: () => "Bearer abc",
}

const providerLoan = {
  title: "FC Forza #8: Bo går i panik",
  authors: ["Lin, Silja"],
  materialId: "9788758859668",
}

const isbnOf = ({ materialId }: { materialId: string }) => materialId

describe("withCatalogueDetails", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("replaces the provider's title and creators with the catalogue's", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      mockJsonResponse(
        catalogueSearchResponse([
          catalogueWork(
            "FC Forza - Bo går i panik",
            ["Silja Lin", "Thomas Vium"],
            [providerLoan.materialId]
          ),
        ])
      )
    )

    const [described] = await withCatalogueDetails(config, [providerLoan], isbnOf)

    expect(described).toEqual({
      ...providerLoan,
      title: "FC Forza - Bo går i panik",
      authors: ["Silja Lin", "Thomas Vium"],
    })
  })

  // A catalogue title is an improvement on what the caller already has, so
  // the list must survive an FBI that does not answer - and say so, since
  // surviving it silently is indistinguishable from a catalogue that knows
  // nothing about the material.
  it("leaves every item as it was when the search fails, and says so", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined)
    const failure = new Error("network down")
    vi.mocked(fetch).mockRejectedValueOnce(failure)

    expect(await withCatalogueDetails(config, [providerLoan], isbnOf)).toEqual([providerLoan])
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("Catalogue search failed"), failure)

    warn.mockRestore()
  })

  it("corrects only the items the catalogue answered for", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      mockJsonResponse(
        catalogueSearchResponse([catalogueWork("Ilddåb", ["Andrzej Sapkowski"], ["9788711234567"])])
      )
    )

    const unknownToCatalogue = { title: "The WITCHER 6", authors: [], materialId: "9788711234599" }
    const described = await withCatalogueDetails(
      config,
      [{ title: "The WITCHER 5", authors: [], materialId: "9788711234567" }, unknownToCatalogue],
      isbnOf
    )

    expect(described).toEqual([
      { title: "Ilddåb", authors: ["Andrzej Sapkowski"], materialId: "9788711234567" },
      unknownToCatalogue,
    ])
  })

  it("keeps the provider's creators for a work the catalogue credits nobody for", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      mockJsonResponse(catalogueSearchResponse([catalogueWork("Ilddåb", [], ["9788711234567"])]))
    )

    const described = await withCatalogueDetails(
      config,
      [{ title: "The WITCHER 5", authors: ["Sapkowski, Andrzej"], materialId: "9788711234567" }],
      isbnOf
    )

    expect(described).toEqual([
      { title: "Ilddåb", authors: ["Sapkowski, Andrzej"], materialId: "9788711234567" },
    ])
  })

  // Resolving the base url throws for a host that never configured FBI. That
  // has to leave the list alone like any other unanswered search - failing it
  // would take down a loan list that worked before the catalogue was consulted.
  it("keeps the provider's fields when the host has no FBI configured", async () => {
    const withoutFbi: ServiceLayerConfig = {
      ...config,
      getBaseUrl: () => {
        throw new Error("Service base url for fbiBaseUrl is not defined.")
      },
    }

    expect(await withCatalogueDetails(withoutFbi, [providerLoan], isbnOf)).toEqual([providerLoan])
  })

  // A host that lends nothing digital never has to declare where FBI lives,
  // so the config is not resolved before there is something to correct.
  it("asks nothing when there is nothing to describe", async () => {
    const withoutFbi: ServiceLayerConfig = {
      ...config,
      getBaseUrl: () => {
        throw new Error("Service base url for fbiBaseUrl is not defined.")
      },
    }

    expect(await withCatalogueDetails(withoutFbi, [], isbnOf)).toEqual([])
    expect(fetch).not.toHaveBeenCalled()
  })
})

describe("withCatalogueDetailsForRequest", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("describes the loan a request produced", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      mockJsonResponse(
        catalogueSearchResponse([
          catalogueWork("FC Forza - Bo går i panik", ["Silja Lin"], ["9788758859668"]),
        ])
      )
    )

    const described = await withCatalogueDetailsForRequest(
      config,
      Promise.resolve({ status: "loanable", loan: providerLoan }),
      providerLoan.materialId
    )

    expect(described.loan).toEqual({
      ...providerLoan,
      title: "FC Forza - Bo går i panik",
      authors: ["Silja Lin"],
    })
  })

  // A request can be answered without a loan - an exceeded quota, say.
  it("passes a loanless decision through untouched", async () => {
    const refused = { status: "quota_exceeded", loan: undefined }

    expect(await withCatalogueDetailsForRequest(config, Promise.resolve(refused), "978")).toBe(
      refused
    )
  })
})
