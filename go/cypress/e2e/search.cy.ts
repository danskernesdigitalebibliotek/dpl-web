import SearchFacetsFactory from "../factories/fbi/searchFacets"
import SearchWithPaginationFactory from "../factories/fbi/searchWithPagination"

describe("Search Result Tests", () => {
  beforeEach(() => {
    // @todo Instead of ignoring exception we should mock the data.
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

    cy.visit("/search")

    // Search for harry potter and press enter
    cy.dataCy("search-input").should("exist").focus().type("harry potter{enter}")
  })

  it("Should get results when searching", () => {
    // Check if search results are displayed
    cy.dataCy("work-card").should("have.length.above", 6)
  })

  it("Should have working facets", () => {
    // Open facets drawer on mobile
    cy.isViewport("mobile").then(
      isMobile => isMobile && cy.dataCy("filters-button").should("exist").click()
    )

    // Both SearchFiltersDesktop and SearchFiltersMobile render filter-buttons:
    // on mobile the desktop column is in DOM but hidden via `display: none`,
    // so we must scope to visible elements before counting/clicking.
    cy.dataCy("filter-button").filter(":visible").should("have.length.above", 10)

    // Intercept search request with only one result
    cy.interceptGraphql({
      operationName: "searchWithPagination",
      data: SearchWithPaginationFactory.transient({ hitcount: 1 }).build(),
    })

    // Select a facet
    cy.dataCy("filter-button").filter(":visible").first().click()

    // Check if facet is selected
    cy.dataCy("filter-button").filter(":visible").first().should("have.class", "bg-foreground")

    // Check that only one result is displayed
    cy.dataCy("work-card").should("have.length", 1)
  })
})
