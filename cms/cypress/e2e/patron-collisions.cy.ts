describe("Adgangsplatformen / CMS user / session mapping", () => {
  const patron1 = {
    authorizationCode: "7c5e3213aea6ef42ec97dfeaa6f5b1d454d856db",
    accessToken: "patron1-token",
    userCPR: 9999999998,
    userGuid: "19a4ae39-be07-4db9-a8b7-8bbb29f03da5",
  };

  const patron2 = {
    // All values here are shifted by 1 digit.
    authorizationCode: "7c5e3213aea6ef42ec97dfeaa6f5b1d454d856dc",
    accessToken: "patron2-token",
    // This patron has a CPR which partially overlaps with patron1.
    userCPR: 9999999999,
    userGuid: "19a4ae39-be07-4db9-a8b7-8bbb29f03da6",
  };

  const patron3 = {
    authorizationCode: "7c5e3213aea6ef42ec97dfeaa6f5b1d454d856dd",
    accessToken: "patron3-token",
    // This patron has a CPR which is entirely different from patron 1.
    userCPR: 1111111111,
    userGuid: "19a4ae39-be07-4db9-a8b7-8bbb29f03da7",
  };

  const patron4 = {
    authorizationCode: "7c5e3213aea6ef42ec97dfeaa6f5b1d454d856de",
    accessToken: "patron4-token",
    userGuid: "19a4ae39-be07-4db9-a8b7-8bbb29f03da8",
  };

  const patron5 = {
    authorizationCode: "7c5e3213aea6ef42ec97dfeaa6f5b1d454d856df",
    accessToken: "patron5-token",
    // This patron has a GUID which partially overlaps with patron4.
    userGuid: "19a4ae39-be07-4db9-a8b7-8bbb29f03da9",
  };

  const patron6 = {
    authorizationCode: "7c5e3213aea6ef42ec97dfeaa6f5b1d454d856df",
    accessToken: "patron5-token",
    // This patron has a GUID which is entirely different from patron 4.
    userGuid: "12345678-abcd-1234-abcd-123456789012",
  };

  beforeEach(() => {
    Cypress.session.clearAllSavedSessions();
    cy.resetMappings();
  });

  afterEach(() => {
    cy.logMappingRequests();
  });

  it("handles logins with identical idents", () => {
    cy.adgangsplatformenLogin(patron1);
    cy.verifyToken({ tokenType: "user", token: patron1.accessToken });

    // Restoring the session should retain the access token.
    // This is simulated by adgangsplatformenLogin() as this will restore the
    // session for the patron when invoked with the same parameters.
    cy.adgangsplatformenLogin(patron1);
    cy.verifyToken({ tokenType: "user", token: patron1.accessToken });
  });

  it("handles logins with overlapping CPRs", () => {
    cy.adgangsplatformenLogin(patron1);
    cy.verifyToken({ tokenType: "user", token: patron1.accessToken });

    cy.adgangsplatformenLogin(patron2);
    cy.verifyToken({ tokenType: "user", token: patron2.accessToken });

    // When patron 1 continues with her session site she must retain her access
    // token even though the CPRs are adjacent.
    cy.adgangsplatformenLogin(patron1);
    cy.verifyToken({ tokenType: "user", token: patron1.accessToken });
  });

  it("handles logins with different CPRs", () => {
    cy.adgangsplatformenLogin(patron1);
    cy.verifyToken({ tokenType: "user", token: patron1.accessToken });

    cy.adgangsplatformenLogin(patron3);
    cy.verifyToken({ tokenType: "user", token: patron3.accessToken });

    cy.adgangsplatformenLogin(patron1);
    cy.verifyToken({ tokenType: "user", token: patron1.accessToken });
  });

  it("handles logins with overlapping GUIDs", () => {
    cy.adgangsplatformenLogin(patron4);
    cy.verifyToken({ tokenType: "user", token: patron4.accessToken });

    cy.adgangsplatformenLogin(patron5);
    cy.verifyToken({ tokenType: "user", token: patron5.accessToken });

    cy.adgangsplatformenLogin(patron4);
    cy.verifyToken({ tokenType: "user", token: patron4.accessToken });
  });

  it("handles logins with different GUIDs", () => {
    cy.adgangsplatformenLogin(patron4);
    cy.verifyToken({ tokenType: "user", token: patron4.accessToken });

    cy.adgangsplatformenLogin(patron6);
    cy.verifyToken({ tokenType: "user", token: patron6.accessToken });

    cy.adgangsplatformenLogin(patron4);
    cy.verifyToken({ tokenType: "user", token: patron4.accessToken });
  });
});
