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
});
