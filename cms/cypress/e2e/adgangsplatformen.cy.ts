describe("Adgangsplatformen", () => {
  it("supports login with both uniqueId and CPR attribute", () => {
    const authorizationCode = "7c5e3213aea6ef42ec97dfeaa6f5b1d454d856dc";
    const accessToken = "447131b0a03fe0421204c54e5c21a60d70030fd1";
    const userGuid = "19a4ae39-be07-4db9-a8b7-8bbb29f03da6";
    const userCPR = 9999999999;

    cy.adgangsplatformenLogin({ authorizationCode, accessToken, userCPR, userGuid });
    cy.visit("/user");
    cy.url().should("match", /user\/\d+/);
  });

  it("supports login for user with only CPR attribute.", () => {
    // If a user does not have uniqueId attribute, it is a user not previously related to any library.
    const authorizationCode = "7c5e3213aea6ef42ec97dfeaa6f5b1d454d856dc";
    const accessToken = "447131b0a03fe0421204c54e5c21a60-new-user";
    const userCPR = 9999999999;

    cy.adgangsplatformenLogin({ authorizationCode, accessToken, userCPR });
    cy.visit("/user");
    cy.url().should("match", /user\/\d+/);
  });

  it("supports login for user only with uniqueId attribute.", () => {
    // If a user do not have a CPR attribute, it is probably a test user.
    const authorizationCode = "7c5e3213aea6ef42ec97dfeaa6f5b1d454d856dc";
    const accessToken = "447131b0a03fe0421204c54e5c21a60-new-user";
    const userGuid = "19a4ae39-be07-4db9-a8b7-8bbb29f03da6";

    cy.adgangsplatformenLogin({ authorizationCode, accessToken, userGuid });
    cy.visit("/user");
    cy.url().should("match", /user\/\d+/);
  });

  it("does not support login with users missing both uniqueId and CPR attribute.", () => {
    // If a user do not have a CPR attribute, it is probably a test user.
    const authorizationCode = "7c5e3213aea6ef42ec97dfeaa6f5b1d454d856dc";
    const accessToken = "447131b0a03fe0421204c54e5c21a60-new-user";

    cy.adgangsplatformenLogin({ authorizationCode, accessToken });
    cy.contains("body", "The website encountered an unexpected error. Please try again later.");
  });

  beforeEach(() => {
    cy.resetMappings();
  });

  afterEach(() => {
    cy.logMappingRequests();
  });
});
