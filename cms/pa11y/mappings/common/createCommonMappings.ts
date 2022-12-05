import { Options } from "wiremock-rest-client/dist/model/options.model";
import wiremock from "../../lib/general";

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
              // We use picsum as a service to generate random images.
              // The size of the image reflects the size of the cover we usually get.
              url: "https://picsum.photos/98/160",
              format: "jpeg",
              size: "small",
            },
            large: {
              url: "https://picsum.photos/142/172",
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
        jsonBody: json.default
      }
    });
  });

};
