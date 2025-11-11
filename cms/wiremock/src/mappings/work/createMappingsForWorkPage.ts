import { Options } from "wiremock-rest-client/dist/model/options.model";
import wiremock, { matchGraphqlQuery, matchWidVariable } from "../../lib/general";

export default (baseUri?: string, options?: Options) => {
  // Get Work.
  import("./data/fbi/getMaterial.json").then((json) => {
    wiremock(baseUri, options).mappings.createMapping({
      request: {
        method: "POST",
        urlPattern: "/next.*/graphql",
        bodyPatterns: [
          {matchesJsonPath: matchGraphqlQuery("getMaterial")},
          {or: [
            {matchesJsonPath: matchWidVariable("work-of:870970-basis:25245784")},
            {matchesJsonPath: matchWidVariable("work-of:870970-basis:54129807")},
          ]}
        ],
      },
      response: {
        jsonBody: json,
      },
    });
  });

  // Work for proxy-url.cy.ts
  import("./data/fbi/getMaterialOnline.json").then((json) => {
    wiremock(baseUri, options).mappings.createMapping({
      request: {
        method: "POST",
        urlPattern: "/next.*/graphql",
        bodyPatterns: [
          {matchesJsonPath: matchGraphqlQuery("getMaterial")},
          {matchesJsonPath: matchWidVariable("work-of:150060-pressdisp:9GVA")},
        ],
      },
      response: {
        jsonBody: json,
      },
    });
  });

  // Get work info for work.cy.ts.
  import("./data/fbi/WorkInfo.json").then((json) => {
    wiremock(baseUri, options).mappings.createMapping({
      request: {
        method: "POST",
        urlPattern: "/next.*/graphql",
        bodyPatterns: [
          {matchesJsonPath: matchGraphqlQuery("WorkInfo")},
          {matchesJsonPath: matchWidVariable("work-of:870970-basis:25245784")}
        ],
      },
      response: {
        jsonBody: json,
      },
    });
  });

    // Get work info for proxy-url.cy.ts.
  import("./data/fbi/WorkInfoOnline.json").then((json) => {
    wiremock(baseUri, options).mappings.createMapping({
      request: {
        method: "POST",
        urlPattern: "/next.*/graphql",
        bodyPatterns: [
          {matchesJsonPath: matchGraphqlQuery("WorkInfo")},
          {matchesJsonPath: matchWidVariable("work-of:150060-pressdisp:9GVA")},
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
        urlPattern:
          "/external/agencyid/catalog/holdingsLogistics/v1\\?recordid=.*",
      },
      response: {
        jsonBody: json.default,
      },
    });
  });

  wiremock(baseUri, options).mappings.createMapping({
      request: {
        method: "POST",
        urlPattern: "/next.*/graphql",
        bodyPatterns: [
          {matchesJsonPath: matchGraphqlQuery("WorkRecommendations")},
        ],
      },
      response: {
        jsonBody: {"data":{"recommend":{"result":[]}}},
      },
    })
};
