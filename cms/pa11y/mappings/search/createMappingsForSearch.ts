import { Options } from "wiremock-rest-client/dist/model/options.model";
import wiremock, { matchGraphqlQuery } from "../../lib/general";

export default (baseUri?: string, options?: Options) => {
  // Search for "Harry Potter".
  import("./data/fbi/searchWithPagination.json").then((json) => {
    wiremock(baseUri, options).mappings.createMapping({
      request: {
        method: "POST",
        urlPath: "/opac/graphql",
        bodyPatterns: [
          {
            matchesJsonPath: matchGraphqlQuery("searchWithPagination"),
          },
        ],
      },
      response: {
        jsonBody: json,
      },
    });
  });

  // Get intelligent facets.
  import("./data/fbi/intelligentFacets.json").then((json) => {
    wiremock(baseUri, options).mappings.createMapping({
      request: {
        method: "POST",
        urlPath: "/opac/graphql",
        bodyPatterns: [
          {
            matchesJsonPath: matchGraphqlQuery("intelligentFacets"),
          },
        ],
      },
      response: {
        jsonBody: json,
      },
    });
  });

  // Get searchFacets.
  import("./data/fbi/searchFacet.json").then((json) => {
    wiremock(baseUri, options).mappings.createMapping({
      request: {
        method: "POST",
        urlPath: "/opac/graphql",
        bodyPatterns: [
          {
            matchesJsonPath: matchGraphqlQuery("searchFacet"),
          },
        ],
      },
      response: {
        jsonBody: json,
      },
    });
  });

  // Get campaign.
  wiremock(baseUri, options).mappings.createMapping({
    request: {
      method: "POST",
      urlPath: "/dpl_campaign/match",
    },
    response: {
      status: 404,
    },
  });
};
