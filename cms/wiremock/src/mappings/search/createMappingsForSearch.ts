import { Options } from "wiremock-rest-client/dist/model/options.model";
import wiremock, { matchGraphqlQuery } from "../../lib/general";

export default async (baseUri?: string, options?: Options) => {
  // Search for "Harry Potter".
  await import("./data/fbi/searchWithPagination.json").then((json) =>
    wiremock(baseUri, options).mappings.createMapping({
      // Persistent so it survives cy.resetMappings() (the login/session flow
      // resets mappings mid-suite; without this the FBI mocks vanish -> 404).
      persistent: true,
      request: {
        method: "POST",
        urlPattern: "/next.*/graphql",
        bodyPatterns: [
          {
            matchesJsonPath: matchGraphqlQuery("searchWithPagination"),
          },
        ],
      },
      response: {
        jsonBody: json,
      },
    })
  );

  // Get intelligent facets.
  await import("./data/fbi/intelligentFacets.json").then((json) =>
    wiremock(baseUri, options).mappings.createMapping({
      // Persistent so it survives cy.resetMappings() (the login/session flow
      // resets mappings mid-suite; without this the FBI mocks vanish -> 404).
      persistent: true,
      request: {
        method: "POST",
        urlPattern: "/next.*/graphql",
        bodyPatterns: [
          {
            matchesJsonPath: matchGraphqlQuery("intelligentFacets"),
          },
        ],
      },
      response: {
        jsonBody: json,
      },
    })
  );

  // Get searchFacets.
  await import("./data/fbi/searchFacet.json").then((json) =>
    wiremock(baseUri, options).mappings.createMapping({
      // Persistent so it survives cy.resetMappings() (the login/session flow
      // resets mappings mid-suite; without this the FBI mocks vanish -> 404).
      persistent: true,
      request: {
        method: "POST",
        urlPattern: "/next.*/graphql",
        bodyPatterns: [
          {
            matchesJsonPath: matchGraphqlQuery("searchFacet"),
          },
        ],
      },
      response: {
        jsonBody: json,
      },
    })
  );

  // Get covers. This returns the same cover for everything, but at
  // least it prevents errors.
  await import("./data/fbi/covers.json").then((json) =>
    wiremock(baseUri, options).mappings.createMapping({
      // Persistent so it survives cy.resetMappings() (the login/session flow
      // resets mappings mid-suite; without this the FBI mocks vanish -> 404).
      persistent: true,
      request: {
        method: "POST",
        urlPattern: "/next.*/graphql",
        bodyPatterns: [
          {
            matchesJsonPath: matchGraphqlQuery("GetCoversByPids"),
          },
        ],
      },
      response: {
        jsonBody: json,
      },
    })
  );
};
