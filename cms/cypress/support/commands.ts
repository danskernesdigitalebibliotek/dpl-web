import { WireMockRestClient } from "wiremock-rest-client";
import { Options } from "wiremock-rest-client/dist/model/options.model";
import { StubMapping } from "wiremock-rest-client/dist/model/stub-mapping.model";

const wiremock = (baseUri?: string, options?: Options) => {
  return new WireMockRestClient(
    baseUri || Cypress.env("WIREMOCK_URL"),
    options
  );
};

Cypress.Commands.add("createMapping", (stub: StubMapping) => {
  cy.wrap(wiremock().mappings.createMapping(stub));
});

Cypress.Commands.add("resetMappings", () => {
  cy.wrap(wiremock().mappings.resetAllMappings());
});

Cypress.Commands.add("logMappingRequests", () => {
  cy.wrap(
    wiremock()
      .mappings.getAllMappings()
      .then((mappings) => {
        mappings.mappings.forEach((stub) => {
          wiremock()
            .requests.getCount(stub.request)
            .then((request: { count: number }) => {
              const requestUrlPath =
                stub.request.url ||
                stub.request.urlPattern ||
                stub.request.urlPath ||
                stub.request.urlPathPattern;
              Cypress.log({
                name: "Wiremock",
                message: `${stub.request.method}: ${requestUrlPath}: ${request.count} hit`,
              });
            });
        });
      })
  );
});

Cypress.Commands.add("drupalLogin", () => {
  cy.visit("/user/login");
  cy.get('[name="name"]')
    .type(Cypress.env("DRUPAL_USERNAME"))
    .parent()
    .get('[name="pass"]')
    .type(Cypress.env("DRUPAL_USERNAME"));
  cy.get('[value="Log ind"]').click();
});

Cypress.Commands.add("drupalLogout", () => {
  cy.visit("/logout");
});

Cypress.Commands.add("drupalCron", () => {
  // Because we run Wiremock as a proxy only services configured with the
  //  proxy will use it. We need to proxy requests during cron and only the
  // web container is configured to use the proxy and thus we have to run
  // cron through the web frontend. Using the proxy with the CLI container would
  // cause too many irrelevant requests to pass throuh the proxy.
  cy.drupalLogin();
  cy.visit("/admin/config/system/cron");
  cy.get('[value="Kør cron"]').click();
  cy.contains("Cron-opgave fuldført.");
  cy.drupalLogout();
});

Cypress.Commands.add(
  "adgangsplatformenLogin",
  (authorizationCode: string, accessToken: string, userGuid: string) => {
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
  }
);

// According to the documentation of types and Cypress commands
// the namespace is declared like it is done here. Therefore we'll bypass errors about it.
/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  namespace Cypress {
    interface Chainable {
      createMapping(stub: StubMapping): Chainable<null>;
      resetMappings(): Chainable<null>;
      logMappingRequests(): Chainable<null>;
      drupalLogin(): Chainable<null>;
      drupalLogout(): Chainable<null>;
      drupalCron(): Chainable<null>;
      adgangsplatformenLogin(
        authorizationCode: string,
        accessToken: string,
        userGuid: string
      ): Chainable<null>;
    }
  }
}
