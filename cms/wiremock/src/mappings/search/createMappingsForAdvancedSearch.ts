import { Options } from "wiremock-rest-client/dist/model/options.model";
import wiremock, { matchGraphqlQuery } from "../../lib/general";

export default async (baseUri?: string, options?: Options) => {
  // Search for "Harry Potter".
  await import("./data/fbi/advancedSearchWithPagination.json").then((json) =>
    wiremock(baseUri, options).mappings.createMapping({
      // Persistent so it survives cy.resetMappings() (the login/session flow
      // resets mappings mid-suite; without this the FBI mocks vanish -> 404).
      persistent: true,
      request: {
        method: "POST",
        urlPattern: "/next.*/graphql",
        bodyPatterns: [
          {
            matchesJsonPath: matchGraphqlQuery("complexSearchWithPagination"),
          },
        ],
      },
      response: {
        jsonBody: json,
      },
    })
  );
};
