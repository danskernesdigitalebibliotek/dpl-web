import { Options } from "wiremock-rest-client/dist/model/options.model";
import wiremock, { matchGraphqlQuery } from "../../lib/general";

export default (baseUri?: string, options?: Options) => {
  // Mapping for covers.
  wiremock(baseUri, options).mappings.createMapping({
    request: {
      method: "GET",
      urlPattern: "/api/v2/covers.*",
    },
    response: {
      transformers: ["response-template"],
      jsonBody: [
        {
          id: "{{request.query.identifiers}}",
          type: "pid",
          imageUrls: {
            small: {
              url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P//PwAGBAL/VJiKjgAAAABJRU5ErkJggg==",
              format: "jpeg",
              size: "small",
            },
            large: {
              url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P//PwAGBAL/VJiKjgAAAABJRU5ErkJggg==",
              format: "jpeg",
              size: "large",
            },
          },
        },
      ],
    },
  });

  // Mapping for material list.
  wiremock(baseUri, options).mappings.createMapping({
    request: {
      method: "HEAD",
      urlPattern: "/list/default/.*",
    },
    response: {
      jsonBody: {},
    },
  });

  // Mapping for availability.
  wiremock(baseUri, options).mappings.createMapping({
    request: {
      method: "GET",
      urlPattern: "/external/agencyid/catalog/availability/v3\\?recordid=.*",
    },
    response: {
      transformers: ["response-template"],
      jsonBody: [
        {
          recordId: "{{request.query.recordid}}",
          // We simulate that the service can return true/false
          // depending on if it is reservable.
          // In that way we should eg. get different availability labels.
          reservable: "{{pickRandom true false}}",
          // Same goes for the availability property.
          available: "{{pickRandom true false}}",
          // We also want to simulate how many reservations there are.
          reservations: "{{randomInt lower=0 upper=10}}",
        },
      ],
    },
  });

  // Mapings for branches
  import("./data/fbs/getBranches.json").then((json) => {
    wiremock(baseUri, options).mappings.createMapping({
      request: {
        method: "GET",
        urlPattern: "/external/v1/agencyid/branches",
      },
      response: {
        jsonBody: json.default,
      },
    });
  });

  // Mapings for autosuggest
  import("../search/data/fbi/autosugggest.json").then((json) => {
    wiremock(baseUri, options).mappings.createMapping({
      request: {
        method: "POST",
        urlPattern: "/next.*/graphql",
        bodyPatterns: [
          {
            matchesJsonPath: matchGraphqlQuery("suggestionsFromQueryString"),
          },
        ],
      },
      response: {
        jsonBody: json.default,
      },
    });
  });
};
