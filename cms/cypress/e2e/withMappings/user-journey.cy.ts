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
      .should("contain", "Showing results for “Harry")
      .getBySel("availability-label")
      .should("exist")
      .getBySel("search-result-list")
      .children()
      .first()
      .click()
      .url()
      .should("include", "work/work-of:870970-basis:54181744");
  });

  it("Shows material page & reservation button is rendered", () => {
    cy.visit("/work/work-of:870970-basis:54181744")
      .contains("Harry Potter og Fønixordenen")
      .getBySel("material-header-buttons-physical")
      .should("contain", "Reserve bog");
  });

  afterEach(() => {
    cy.logMappingRequests();
  });
});
