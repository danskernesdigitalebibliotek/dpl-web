import coverService from "../factories/coverService"
import SearchFacetsFactory from "../factories/searchFacets"
import SearchWithPaginationFactory from "../factories/searchWithPagination"

describe("Search Result Tests", () => {
  beforeEach(() => {
    // Ignore fetch errors from DPL CMS
    cy.expectError("Failed to fetch data from DPL CMS")
    // Intercept search request
    cy.interceptGraphql({
      operationName: "searchWithPagination",
      data: SearchWithPaginationFactory.build(),
    })
    // Intercept search facets
    cy.interceptGraphql({
      operationName: "searchFacets",
      data: SearchFacetsFactory.build(),
    })
    // Intercept covers request
    cy.interceptCovers({
      covers: coverService.build(),
    })

    cy.visit("/search")

    // Search for harry potter and press enter
    cy.dataCy("search-input").should("exist").focus().type("harry potter{enter}")
  })

  it("Should get results when searching", () => {
    // Check if search results are displayed
    cy.dataCy("work-card").should("have.length.above", 6)
  })

  it("Should have working facets", () => {
    // Check if facets are displayed
    cy.dataCy("filters-button").should("exist").click()

    // Check if facets are displayed
    cy.dataCy("filter-button").should("have.length.above", 40)

    // Intercept search request with only one result
    cy.interceptGraphql({
      operationName: "searchWithPagination",
      data: SearchWithPaginationFactory.transient({ hitcount: 1 }).build(),
    })

    // Select a facet
    cy.dataCy("filter-button").first().click()

    // Check if facet is selected
    cy.dataCy("filter-button").should("have.length", 1)

    // Check that only one result is displayed
    cy.dataCy("work-card").should("have.length", 1)
  })
})
