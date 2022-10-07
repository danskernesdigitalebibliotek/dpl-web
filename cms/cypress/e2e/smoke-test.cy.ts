describe("DPL CMS", () => {
  it("loads the front page", () => {
    cy.visit("/");
    cy.contains("DPL CMS");
  });

  it("supports login", () => {
    cy.drupalLogin();
    // We do not have a proper way to determine that the user is actually
    // logged in. For now we simply check whether the user is logged in. If that
    // is the case then the /user route will redirect to the user/id route.
    // Conversely when logged out the /user route will redirect to the
    // /user/login route.
    cy.visit("/user")
      .url()
      .should("match", /user\/\d+/);
    cy.drupalLogout();
    cy.visit("user")
      .url()
      .should("match", /user\/login$/);
  });
});
