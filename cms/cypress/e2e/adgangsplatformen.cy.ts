describe("Adgangsplatformen", () => {
  it("supports login", () => {
    const authorizationCode = "7c5e3213aea6ef42ec97dfeaa6f5b1d454d856dc";
    const accessToken = "447131b0a03fe0421204c54e5c21a60d70030fd1";
    const userGuid = "19a4ae39-be07-4db9-a8b7-8bbb29f03da6";

    cy.createMapping({
      request: {
        method: "GET",
        urlPath: "/oauth/authorize",
        queryParameters: {
          response_type: {
            equalTo: "code",
          },
        },
      },
      response: {
        status: 302,
        headers: {
          location: `{{request.query.[redirect_uri]}}?code=${authorizationCode}&state={{request.query.[state]}}`,
        },
        transformers: ["response-template"],
      },
    });

    cy.createMapping({
      request: {
        method: "POST",
        urlPath: "/oauth/token/",
        bodyPatterns: [
          {
            contains: "grant_type=authorization_code",
          },
          {
            contains: `code=${authorizationCode}`,
          },
        ],
      },
      response: {
        jsonBody: {
          access_token: accessToken,
          token_type: "Bearer",
          expires_in: 2591999,
        },
      },
    });

    cy.createMapping({
      request: {
        method: "GET",
        urlPath: "/userinfo/",
        headers: {
          Authorization: {
            equalTo: `Bearer ${accessToken}`,
          },
        },
      },
      response: {
        jsonBody: {
          attributes: {
            uniqueId: userGuid,
          },
        },
      },
    });

    cy.visit("/user/login");
    cy.contains("Log in with Adgangsplatformen").click();
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
