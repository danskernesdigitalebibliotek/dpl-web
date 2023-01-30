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

  afterEach(() => {
    cy.logMappingRequests();
  });
});
