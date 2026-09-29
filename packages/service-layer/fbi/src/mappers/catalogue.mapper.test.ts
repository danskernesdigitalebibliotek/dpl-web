import { describe, expect, it } from "vitest"

import { catalogueSearchResult, catalogueWork } from "../../../src/test-utils"
import { parseAndMapCatalogueDetails } from "./catalogue.mapper"

describe("parseAndMapCatalogueDetails", () => {
  it("credits every creator, not only the first", () => {
    const raw = catalogueSearchResult([
      catalogueWork("FC Forza - Bo går i panik", ["Silja Lin", "Thomas Vium"], ["9788758859668"]),
    ])

    expect(
      parseAndMapCatalogueDetails(raw, ["9788758859668"]).get("9788758859668")?.authors
    ).toEqual(["Silja Lin", "Thomas Vium"])
  })

  it("maps several works from one search", () => {
    const raw = catalogueSearchResult([
      catalogueWork("Ilddåb", ["Andrzej Sapkowski"], ["9788711234567"]),
      catalogueWork("Tættere end man tror", ["Brad Parks"], ["9788771076950"]),
    ])

    const catalogue = parseAndMapCatalogueDetails(raw, ["9788711234567", "9788771076950"])
    expect(catalogue.get("9788711234567")?.title).toBe("Ilddåb")
    expect(catalogue.get("9788771076950")?.title).toBe("Tættere end man tror")
  })

  it("is empty when the search matched nothing", () => {
    expect(parseAndMapCatalogueDetails(catalogueSearchResult([]), ["9788711234567"]).size).toBe(0)
  })

  it("credits nobody for a work with no creators", () => {
    const raw = catalogueSearchResult([catalogueWork("Ilddåb", [], ["9788711234567"])])

    expect(
      parseAndMapCatalogueDetails(raw, ["9788711234567"]).get("9788711234567")?.authors
    ).toEqual([])
  })

  // A work is matched through any of its editions, so it answers for whichever
  // of the requested ISBNs it carries - and it carries identifiers that are
  // not ISBNs at all, plus editions nobody asked about.
  it("keys only the ISBNs that were requested", () => {
    const raw = catalogueSearchResult([
      {
        titles: { full: ["Ilddåb"] },
        creators: [{ display: "Andrzej Sapkowski" }],
        manifestations: {
          all: [
            {
              identifiers: [
                { type: "PUBLIZON", value: "9788711234567" },
                { type: "ISBN", value: "9788711234567" },
                { type: "ISBN", value: "9788711299999" },
                { type: "ISSN", value: "1234-5678" },
              ],
            },
          ],
        },
      },
    ])

    expect([...parseAndMapCatalogueDetails(raw, ["9788711234567"]).keys()]).toEqual([
      "9788711234567",
    ])
  })

  it("drops a work with no title rather than throwing", () => {
    const raw = catalogueSearchResult([
      { ...catalogueWork("", [], ["9788711234567"]), titles: { full: [] } },
    ])

    expect(parseAndMapCatalogueDetails(raw, ["9788711234567"]).size).toBe(0)
  })

  it("ignores fields FBI adds beyond what the query asked for", () => {
    const raw = catalogueSearchResult([
      {
        ...catalogueWork("Ilddåb", ["Andrzej Sapkowski"], ["9788711234567"]),
        workId: "work-of:870970-basis:11111111",
        abstract: ["Noget om en heks"],
      },
    ])

    expect(parseAndMapCatalogueDetails(raw, ["9788711234567"]).get("9788711234567")?.title).toBe(
      "Ilddåb"
    )
  })

  it("throws when the response is not a search result at all", () => {
    expect(() => parseAndMapCatalogueDetails({ data: null }, [])).toThrow()
  })
})
