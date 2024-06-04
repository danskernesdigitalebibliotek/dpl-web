import { Options } from "wiremock-rest-client/dist/model/options.model";
import wiremock, { matchGraphqlQuery } from "../../lib/general";

export default (baseUri?: string, options?: Options) => {
  // Search for "Harry Potter".
  import("./data/fbi/advancedSearchWithPagination.json").then((json) => {
    wiremock(baseUri, options).mappings.createMapping({
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
    });
  });
};
