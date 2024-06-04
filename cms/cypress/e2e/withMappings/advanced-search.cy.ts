describe("User journey", () => {
  it("Can access the advanced search page from home page", () => {
    cy.visit("/arrangementer").getBySel("search-header-dropdown-icon").click();
    cy.getBySel("search-header-dropdown").click();
    cy.url().should("include", "advanced-search");
    cy.get("h1").should("contain", "advanced search");
  });

  it("Can fill out the search form, translate it into CQL & switch to CQL search with the same translation", () => {
    cy.visit("/advanced-search");
    cy.getBySel("advanced-search-header-row").first().click().type("Harry");
    cy.getBySel("advanced-search-header-row").eq(1).click().type("Prince");
    cy.getBySel("advanced-search-header-row")
      .eq(1)
      .getBySel("clauses")
      .getBySel("clause-NOT")
      .click();
    cy.getBySel("preview-section")
      .first()
      .should("contain", "'Harry' NOT 'Prince'");
    cy.getBySel("advanced-search-edit-cql").eq(1).click();
    cy.getBySel("cql-search-header-input").should(
      "contain",
      "'Harry' NOT 'Prince'"
    );
  });

  it("Can search and show search results", () => {
    cy.visit("/advanced-search");
    cy.getBySel("advanced-search-header-row").first().click().type("Harry");
    cy.getBySel("advanced-search-header-row").eq(1).click().type("Prince");
    cy.getBySel("search-button").click();
    cy.getBySel("search-result-list").should("exist");
    cy.getBySel("card-list-item").should("exist");
  });
});
