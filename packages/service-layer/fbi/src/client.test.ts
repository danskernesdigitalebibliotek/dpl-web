import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { catalogueSearchResponse, catalogueWork, mockJsonResponse } from "../../src/test-utils"
import { createFbiClient } from "./client"

const baseUrl = "https://fbi.example/graphql"

const buildClient = (getAuthHeader: () => Promise<string> | string = () => "Bearer abc") =>
  createFbiClient({ baseUrl, getAuthHeader })

const bodyOf = (call: number) => {
  const [, init] = vi.mocked(fetch).mock.calls[call] as [string, RequestInit]
  return JSON.parse(init.body as string) as { query: string; variables: Record<string, unknown> }
}

describe("createFbiClient.getCatalogueDetails", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("asks for every ISBN in one search and maps the answer", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      mockJsonResponse(
        catalogueSearchResponse([
          catalogueWork("Ilddåb", ["Andrzej Sapkowski"], ["9788711234567"]),
          catalogueWork("Tættere end man tror", ["Brad Parks"], ["9788771076950"]),
        ])
      )
    )

    const result = await buildClient().getCatalogueDetails(["9788711234567", "9788771076950"])

    expect(fetch).toHaveBeenCalledTimes(1)
    expect(fetch).toHaveBeenCalledWith(baseUrl, expect.objectContaining({ method: "POST" }))
    expect(bodyOf(0).variables).toEqual({
      cql: "term.isbn=9788711234567 OR term.isbn=9788771076950",
      // Paged by works, not by search terms: an ISBN can match more than one
      // work record, and a short page would drop a material that was asked for.
      limit: 100,
    })
    expect(result.get("9788711234567")).toEqual({
      title: "Ilddåb",
      authors: ["Andrzej Sapkowski"],
    })
  })

  // One id that is not an ISBN would cost every material in the batch its
  // correction, so anything of no ISBN shape is left out - a digit string of
  // the wrong length included. An ISBN-10's check digit may be an X.
  it("searches for the ISBNs and leaves everything else out", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      mockJsonResponse(catalogueSearchResponse([catalogueWork("Ilddåb", [], ["9788711234567"])]))
    )

    await buildClient().getCatalogueDetails([
      "9788711234567",
      "080442957X",
      "not-an-isbn",
      "12345678901",
    ])

    expect(bodyOf(0).variables.cql).toBe("term.isbn=9788711234567 OR term.isbn=080442957X")
  })

  it("asks nothing when no id is searchable", async () => {
    expect(await buildClient().getCatalogueDetails(["", "paper-book"])).toEqual(new Map())
    expect(await buildClient().getCatalogueDetails([])).toEqual(new Map())
    expect(fetch).not.toHaveBeenCalled()
  })

  it("treats a rejected CQL as a failure, not as an empty catalogue", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      mockJsonResponse({ data: { complexSearch: { errorMessage: "invalid cql", works: [] } } })
    )

    await expect(buildClient().getCatalogueDetails(["9788711234567"])).rejects.toThrow(
      /invalid cql/
    )
  })

  it("applies the auth header", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(mockJsonResponse(catalogueSearchResponse([])))

    await buildClient(async () => "Bearer xyz").getCatalogueDetails(["9788711234567"])

    expect(fetch).toHaveBeenCalledWith(
      baseUrl,
      expect.objectContaining({
        headers: { authorization: "Bearer xyz", "content-type": "application/json" },
      })
    )
  })

  it("throws on an HTTP error", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(mockJsonResponse({}, 503))

    await expect(buildClient().getCatalogueDetails(["9788711234567"])).rejects.toThrow(/503/)
  })

  // FBI reports a rejected query in the body, with a 200 status.
  it("throws when the response carries GraphQL errors", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      mockJsonResponse({ errors: [{ message: "Invalid CQL" }] })
    )

    await expect(buildClient().getCatalogueDetails(["9788711234567"])).rejects.toThrow(
      /Invalid CQL/
    )
  })
})
