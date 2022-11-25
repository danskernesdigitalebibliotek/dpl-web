
import { WireMockRestClient } from "wiremock-rest-client";
import { Options } from "wiremock-rest-client/dist/model/options.model";

export const matchGraphqlQuery = (id: string) => `$.[?(@.query =~ /.*query ${id}\(.*/s)]`;

export const wiremock = (baseUri?: string, options?: Options) => {
  return new WireMockRestClient(
    "http://wiremock",
    options
  );
};

export const simpleGraphqlMapping = (id: string) => {
  import(`/data/${id}.json`).then((json) => {
    wiremock().mappings.createMapping({
      request: {
        method: "POST",
        urlPath: "/opac/graphql",
        "bodyPatterns" : [ {
          "matchesJsonPath" : matchGraphqlQuery(id)
        } ]
      },
      response: {
        jsonBody: json,
      },
    })
  });
}

export default wiremock;

