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

// According to the documentation of types and Cypress commands
// the namespace is declared like it is done here. Therefore we'll bypass errors about it.
/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  namespace Cypress {
    interface Chainable {
      createMapping(stub: StubMapping): Chainable<null>;
      resetMappings(): Chainable<null>;
      logMappingRequests(): Chainable<null>;
    }
  }
}
