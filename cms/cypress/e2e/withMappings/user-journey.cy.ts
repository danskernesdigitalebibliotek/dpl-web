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
      .getBySel("search-result-header")
      .should("contain", "Showing results for “Harry")
      .getBySel("search-result-item-availability")
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
      .getBySel("material-header-content")
      .scrollIntoView()
      .contains("Harry Potter og Fønixordenen")
      .getBySel("material-header-buttons-physical")
      .should("contain", "Reserve bog");
  });

  // TODO: Fix the failing test. It is not able, for some reason, to press the submit button.
  it.skip("Can open reservation modal & reserve a material", () => {
    const authorizationCode = "7c5e3213aea6ef42ec97dfeaa6f5b1d454d856dc";
    const accessToken = "447131b0a03fe0421204c54e5c21a60d70030fd1";
    const userGuid = "19a4ae39-be07-4db9-a8b7-8bbb29f03da6";
    cy.adgangsplatformenLogin(authorizationCode, accessToken, userGuid);
    cy.visit("/work/work-of:870970-basis:54181744");
    cy.getBySel("material-header-author-text").scrollIntoView();
    cy.getBySel("material-header-buttons-physical").click();
    cy.getBySel("modal")
      .should("be.visible")
      .and("contain", "Harry Potter og Fønixordenen");
    cy.getBySel("reservation-modal-submit-button").click();
    cy.getBySel("reservation-success-title-text")
      .should("exist")
      .and("contain", "The material is available and is now reserved for you!");
  });

  afterEach(() => {
    cy.logMappingRequests();
  });
});
