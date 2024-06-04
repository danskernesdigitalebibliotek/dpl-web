import { Options } from "wiremock-rest-client/dist/model/options.model";
import wiremock, { matchGraphqlQuery } from "../../lib/general";

export default (baseUri?: string, options?: Options) => {
  // Get Work.
  import("./data/fbi/getMaterial.json").then((json) => {
    wiremock(baseUri, options).mappings.createMapping({
      request: {
        method: "POST",
        urlPattern: "/next.*/graphql",
        bodyPatterns: [
          {
            matchesJsonPath: matchGraphqlQuery("getMaterial"),
          },
        ],
      },
      response: {
        jsonBody: json,
      },
    });
  });

  // Get Infomedia.
  import("./data/fbi/getInfomedia.json").then((json) => {
    wiremock(baseUri, options).mappings.createMapping({
      request: {
        method: "POST",
        urlPattern: "/next.*/graphql",
        bodyPatterns: [
          {
            matchesJsonPath: matchGraphqlQuery("getInfomedia"),
          },
        ],
      },
      response: {
        jsonBody: json,
      },
    });
  });

  // Get holdings.
  import("./data/fbs/holdings.json").then((json) => {
    wiremock(baseUri, options).mappings.createMapping({
      request: {
        method: "GET",
        urlPattern: "/external/agencyid/catalog/holdings/v3\\?recordid=.*",
      },
      response: {
        jsonBody: json.default,
      },
    });
  });
};
