describe("User journey", () => {
  it("Shows search suggestions & redirects to search result page", () => {
    cy.visit("/")
      .get(".header__menu-search-input")
      .focus()
      .type("harry")
      .get(".autosuggest")
      .should("be.visible")
      .get(".autosuggest__text")
      .eq(0)
      .click()
      .url()
      .should("include", "search?q=Harry%2520Potter");
  });

  afterEach(() => {
    cy.logMappingRequests();
  });
});
