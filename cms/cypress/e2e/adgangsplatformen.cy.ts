describe("Adgangsplatformen", () => {
  // Test is failing because of an "access denied" error after end authentication.
  // TODO: Fix this test.
  it.skip("supports login", () => {
    const authorizationCode = "7c5e3213aea6ef42ec97dfeaa6f5b1d454d856dc";
    const accessToken = "447131b0a03fe0421204c54e5c21a60d70030fd1";
    const userGuid = "19a4ae39-be07-4db9-a8b7-8bbb29f03da6";

    cy.adgangsplatformenLogin(authorizationCode, accessToken, userGuid);
    cy.visit("/user");
    cy.url().should("match", /user\/\d+/);
  });

  beforeEach(() => {
    cy.resetMappings();
  });

  afterEach(() => {
    cy.logMappingRequests();
  });
});
