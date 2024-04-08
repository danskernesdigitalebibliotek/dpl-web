describe("DPL React Apps", () => {
  it("exposes tokens", () => {
    // These dummy values resemble what is used in production scenarios.
    const libraryAccessToken = "447131b0a03fe0421204c54e5c21a60d70030fd2";
    const authorizationCode = "7c5e3213aea6ef42ec97dfeaa6f5b1d454d856dc";
    const accessToken = "447131b0a03fe0421204c54e5c21a60d70030fd1";
    const userGuid = "19a4ae39-be07-4db9-a8b7-8bbb29f03da6";
    const userCPR = 9999999999;

    // Running cron will issue a request to retrieve a library token using OAuth
    // password type grants.
    cy.createMapping({
      request: {
        method: "POST",
        urlPath: "/oauth/token/",
        headers: {
          Authorization: {
            contains: `Basic`,
          },
        },
        bodyPatterns: [
          {
            contains: "grant_type=password",
          },
          {
            contains: "username=",
          },
          {
            contains: "password=",
          },
        ],
      },
      response: {
        jsonBody: {
          access_token: libraryAccessToken,
          expires_in: 2591999,
        },
      },
    });
    cy.drupalCron();

    // Logging in will retrieve a user token using OAuth authorization grants.
    cy.adgangsplatformenLogin({
      authorizationCode,
      accessToken,
      userCPR,
      userGuid,
    });

    cy.request("/dpl-react/user-tokens")
      .its("body")
      .should(
        "contain",
        `window.dplReact.setToken("library", "${libraryAccessToken}")`
      )
      .should("contain", `window.dplReact.setToken("user", "${accessToken}")`);
  });

  beforeEach(() => {
    cy.resetMappings();
  });

  afterEach(() => {
    cy.logMappingRequests();
  });
});
