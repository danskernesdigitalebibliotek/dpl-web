describe("Mapp Tracking", () => {
  it("tracks page views", () => {
    const customerId = "1234";

    // Mapp will not perform requests if wt_r cookie is set so clear it before
    // our test and also use cookie debugging to help understand the process.
    cy.clearCookies();
    cy.drupalLogin();
    cy.visit("/admin/config/system/dpl-mapp")
      .get('[name="id"]')
      .clear()
      .type(customerId)
      .parent()
      .get('[value="Save configuration"]')
      .first()
      .click();
    cy.visit("/");
    cy.getRequestCount({
      urlPathPattern: `^/resp/api/get/${customerId}.*`,
    }).should("be.greaterThan", 0);
  });

  beforeEach(() => {
    Cypress.Cookies.debug(true);
    cy.resetRequests();
  });

  afterEach(() => {
    cy.logRequests();
    Cypress.Cookies.debug(false);
  });
});
