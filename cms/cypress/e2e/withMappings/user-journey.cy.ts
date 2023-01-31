describe("User journey", () => {
  it("Shows search suggestions & redirects to search result page", () => {
    cy.visit("/")
      .getBySel("search-header-input")
      .focus()
      .type("harry")
      .getBySel("autosuggest")
      .should("be.visible")
      .getBySel("autosuggest-text-item")
      .first()
      .click()
      .url()
      .should("include", "search?q=Harry%2520Potter");
  });

  it("Shows search results & redirects to material page", () => {
    cy.visit("/search?q=Harry%2520Potter")
      .getBySel("search-result-title")
      .should("contain", "Showing results for “Harry Potter” (109)")
      .getBySel("search-result-list")
      .children()
      .first()
      .click()
      .url()
      .should("include", "work/work-of:870970-basis:25245784");
  });

  afterEach(() => {
    cy.logMappingRequests();
  });
});
