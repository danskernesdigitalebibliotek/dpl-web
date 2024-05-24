import { WireMockRestClient } from "wiremock-rest-client";
import { Options } from "wiremock-rest-client/dist/model/options.model";
import { StubMapping } from "wiremock-rest-client/dist/model/stub-mapping.model";
import { RequestPattern } from "wiremock-rest-client/dist/model/request-pattern.model";
import { randomUUID } from "node:crypto";

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
        Cypress.log({
          name: "Wiremock",
          message: `Mappings: ${mappings.meta.total}`,
        });
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
                message: `${stub.request.method}: ${requestUrlPath}: ${request.count} hit(s)`,
              });
            });
        });
      })
  );
});

Cypress.Commands.add("getRequestCount", (request: RequestPattern) => {
  cy.wrap(
    wiremock()
      .requests.getCount(request)
      .then((response: { count: number }) => {
        return response.count;
      })
  );
});

Cypress.Commands.add("resetRequests", () => {
  cy.wrap(wiremock().requests.resetAllRequests());
});

Cypress.Commands.add("logRequests", () => {
  cy.wrap(
    wiremock()
      .requests.getAllRequests()
      .then((data) => {
        data.requests.forEach((requestResponse) => {
          const request = requestResponse.request;
          Cypress.log({
            name: "Wiremock",
            message: `${request.method}: ${request.url}`,
          });
        });
      })
  );
});

Cypress.Commands.add("drupalLogin", (url?: string) => {
  cy.clearCookies();
  cy.visit("/user/login");
  cy.get('[name="name"]')
    .type(Cypress.env("DRUPAL_USERNAME"))
    .parent()
    .get('[name="pass"]')
    .type(Cypress.env("DRUPAL_PASSWORD"));
  cy.get('[value="Log in"]').click();
  if (url) {
    cy.visit(url);
  }
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
  cy.get('[value="Run cron"]').click();
  cy.contains("Cron ran successfully.");
  cy.drupalLogout();
});

const adgangsplatformenLoginOauthMappings = ({
  userIsAlreadyRegistered,
  authorizationCode,
  accessToken,
  userCPR,
  userGuid,
}: {
  userIsAlreadyRegistered: boolean;
  authorizationCode: string;
  accessToken: string;
  userCPR?: number;
  userGuid?: string;
}) => {
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
          cpr: userCPR,
          ...(userGuid ? { uniqueId: userGuid } : {}),
        },
      },
    },
  });

  const patronBody = (userIsAlreadyRegistered: boolean) => {
    return {
      authenticateStatus: userIsAlreadyRegistered ? "VALID" : "INVALID",
      patron: {
        // This is not a complete patron object but with regards to login/register we only need to ensure an empty blocked
        // status so we leave out all other information.
        blockStatus: [],
      },
    };
  };

  cy.createMapping({
    request: {
      method: "GET",
      urlPath: "/external/agencyid/patrons/patronid/v2",
      headers: {
        Authorization: {
          equalTo: `Bearer ${accessToken}`,
        },
      },
    },
    response: {
      jsonBody: patronBody(userIsAlreadyRegistered),
    },
  });
};

Cypress.Commands.add(
  "adgangsplatformenLogin",
  ({
    authorizationCode,
    accessToken,
    userCPR,
    userGuid,
    validate = true,
    restoreId,
  }: {
    authorizationCode: string;
    accessToken: string;
    userCPR?: number;
    userGuid?: string;
    validate?: boolean;
    restoreId?: string;
  }) => {
    const sessionId = restoreId ?? Math.random();
    cy.session(
      { authorizationCode, accessToken, userCPR, userGuid, sessionId },
      () => {
        adgangsplatformenLoginOauthMappings({
          userIsAlreadyRegistered: true,
          authorizationCode,
          accessToken,
          userCPR,
          userGuid,
        });

        cy.visit("/user/login");
        cy.contains("Log in with Adgangsplatformen").click();
      },
      {
        validate: () => {
          if (!validate) return;
          cy.request("/dpl-react/user-tokens")
            .its("body")
            .should(
              "contain",
              `window.dplReact.setToken("user", "${accessToken}")`
            );
        },
      }
    );
  }
);
Cypress.Commands.add(
  "setupAdgangsplatformenRegisterMappinngs",
  ({
    authorizationCode,
    accessToken,
    userCPR,
    userGuid,
  }: {
    authorizationCode: string;
    accessToken: string;
    userCPR?: number;
    userGuid?: string;
  }) => {
    adgangsplatformenLoginOauthMappings({
      userIsAlreadyRegistered: false,
      authorizationCode,
      accessToken,
      userCPR,
      userGuid,
    });
    cy.createMapping({
      request: {
        method: "POST",
        urlPattern: ".*/external/agencyid/patrons/v4",
      },
      response: {
        jsonBody: {
          authenticated: true,
          patron: {},
        },
      },
    });
    cy.createMapping({
      request: {
        method: "GET",
        // TODO: Create more exact urlPatterns
        urlPattern: ".*/fees.*",
      },
      response: {
        jsonBody: {},
      },
    });
    cy.createMapping({
      request: {
        method: "GET",
        urlPattern: ".*/reservations.*",
      },
      response: {
        jsonBody: {},
      },
    });
    cy.createMapping({
      request: {
        method: "GET",
        urlPattern: ".*/loans.*",
      },
      response: {
        jsonBody: {},
      },
    });
  }
);

Cypress.Commands.add(
  "verifyToken",
  ({
    token,
    tokenType,
  }: {
    tokenType: "library" | "user" | "unregistered-user";
    token: string;
  }) => {
    cy.request("/dpl-react/user-tokens")
      .its("body")
      .should(
        "contain",
        `window.dplReact.setToken("${tokenType}", "${token}")`
      );
  }
);

const visible = (checkVisible: boolean) => (checkVisible ? ":visible" : "");
Cypress.Commands.add("getBySel", (selector, checkVisible = false, ...args) => {
  return cy.get(`[data-cy="${selector}"]${visible(checkVisible)}`, ...args);
});

// According to the documentation of types and Cypress commands
// the namespace is declared like it is done here. Therefore we'll bypass errors about it.
/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  namespace Cypress {
    interface Chainable {
      createMapping(stub: StubMapping): Chainable<null>;
      resetMappings(): Chainable<null>;
      logMappingRequests(): Chainable<null>;
      logRequests(): Chainable<null>;
      getRequestCount(request: RequestPattern): Chainable<number>;
      resetRequests(): Chainable<null>;
      drupalLogin(url?: string): Chainable<null>;
      drupalLogout(): Chainable<null>;
      drupalCron(): Chainable<null>;
      adgangsplatformenLogin(params: {
        authorizationCode: string;
        accessToken: string;
        userCPR?: number;
        userGuid?: string;
        validate?: boolean;
        restoreId?: string;
      }): Chainable<null>;
      setupAdgangsplatformenRegisterMappinngs(params: {
        authorizationCode: string;
        accessToken: string;
        userCPR?: number;
        userGuid?: string;
      }): Chainable<null>;
      verifyToken(params: {
        tokenType: "library" | "user" | "unregistered-user";
        token: string;
      }): Chainable<null>;
      getBySel(
        selector: string,
        checkVisible?: boolean,
        ...args: unknown[]
      ): Chainable;
    }
  }
}
