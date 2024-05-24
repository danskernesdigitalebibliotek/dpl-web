describe("Adgangsplatformen / CMS users", () => {
  const patron1 = {
    authorizationCode: "7c5e3213aea6ef42ec97dfeaa6f5b1d454d856db",
    accessToken: "patron1-token",
    userCPR: 9999999998,
    userGuid: "19a4ae39-be07-4db9-a8b7-8bbb29f03da5",
    validate: false,
  };

  const patron2 = {
    // All values here are shifted by 1 digit.
    authorizationCode: "7c5e3213aea6ef42ec97dfeaa6f5b1d454d856dc",
    accessToken: "patron2-token",
    userCPR: 9999999999,
    userGuid: "19a4ae39-be07-4db9-a8b7-8bbb29f03da6",
  };

  const patron3 = {
    authorizationCode: "7c5e3213aea6ef42ec97dfeaa6f5b1d454d856dd",
    accessToken: "patron3-token",
    userCPR: 1111111111,
    userGuid: "19a4ae39-be07-4db9-a8b7-8bbb29f03da7",
  };

  function verifyUserTokens(accessToken: string) {
    cy.request("/dpl-react/user-tokens")
      .its("body")
      .should("contain", `window.dplReact.setToken("user", "${accessToken}")`);
  }

  beforeEach(() => {
    Cypress.session.clearAllSavedSessions();
    cy.resetMappings();
  });

  afterEach(() => {
    cy.logMappingRequests();
  });

  it("handles logins with identical idents", () => {
    cy.adgangsplatformenLogin(patron1);

    verifyUserTokens(patron1.accessToken);

    cy.adgangsplatformenLogin(patron1);

    verifyUserTokens(patron1.accessToken);
  });

  it("handles logins with overlapping idents", () => {
    cy.adgangsplatformenLogin({ ...patron1, restoreId: "overlap" });
    verifyUserTokens(patron1.accessToken);

    cy.adgangsplatformenLogin(patron2);
    verifyUserTokens(patron2.accessToken);

    cy.adgangsplatformenLogin({ ...patron1, restoreId: "overlap" });
    verifyUserTokens(patron1.accessToken);
  });

  it("handles logins with different idents", () => {
    cy.adgangsplatformenLogin({ ...patron1, restoreId: "different" });
    verifyUserTokens(patron1.accessToken);

    cy.adgangsplatformenLogin(patron3);
    verifyUserTokens(patron3.accessToken);

    cy.adgangsplatformenLogin({ ...patron1, restoreId: "different" });
    verifyUserTokens(patron1.accessToken);
  });
});
