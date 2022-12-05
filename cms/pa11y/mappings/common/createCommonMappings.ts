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
      jsonBody: [
        {
          id: "870970-basis:134693959",
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

  // Mapping for tokens (anonymous session).
  wiremock(baseUri, options).mappings.createMapping({
    request: {
      method: "GET",
      urlPath: "/dpl-react/user-tokens",
    },
    response: {
      headers: {
        "Content-Type": "application/txt",
      },
      body: 'window.dplReact = window.dplReact || {};\nwindow.dplReact.setToken("library", "fcd5c29a171f97b626d71eceffe1313f00a284b0")',
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
          reservable: "{{pickRandom true false}}",
          available: "{{pickRandom true false}}",
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
