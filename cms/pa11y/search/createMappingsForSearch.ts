
import { Options } from "wiremock-rest-client/dist/model/options.model";
import wiremock, { matchGraphqlQuery } from "../lib/general";

export default (baseUri?: string, options?: Options) => {

  // Search for "Harry Potter".
  // simpleGraphqlMapping("searchWithPagination");
  import('./data/fbi/searchWithPagination.json').then((json) => {
    wiremock(baseUri, options).mappings.createMapping({
      request: {
        method: "POST",
        urlPath: "/opac/graphql",
        "bodyPatterns": [{
          "matchesJsonPath": matchGraphqlQuery("searchWithPagination")
        }]
      },
      response: {
        jsonBody: json,
      },
    })
  });

  // Get intelligent facets.
  import('./data/fbi/intelligentFacets.json').then((json) => {
    wiremock(baseUri, options).mappings.createMapping({
      request: {
        method: "POST",
        urlPath: "/opac/graphql",
        "bodyPatterns": [{
          "matchesJsonPath": matchGraphqlQuery("intelligentFacets")
        }]
      },
      response: {
        jsonBody: json,
      },
    })
  });

  // Get searchFacets.
  import('./data/fbi/searchFacet.json').then((json) => {
    wiremock(baseUri, options).mappings.createMapping({
      request: {
        method: "POST",
        urlPath: "/opac/graphql",
        "bodyPatterns": [{
          "matchesJsonPath": matchGraphqlQuery("searchFacet")
        }]
      },
      response: {
        jsonBody: json,
      },
    })
  });

  // Get covers.
  import('./data/covers/covers.json').then((json) => {
    wiremock(baseUri, options).mappings.createMapping({
      request: {
        method: "GET",
        urlPattern: "/api/v2/covers.*",
      },
      response: {
        jsonBody: json,
      },
    })
  });

  // Get material list.
  wiremock(baseUri, options).mappings.createMapping({
    request: {
      method: "HEAD",
      urlPath: "/list/default/.*",
    },
    response: {
      "status": 404
    },
  });

  // Get user-tokens.
  wiremock(baseUri, options).mappings.createMapping({
    request: {
      method: "GET",
      urlPath: "/dpl-react/user-tokens",
    },
    response: {
      headers: {
        "Content-Type": "application/txt"
      },
      body: 'window.dplReact = window.dplReact || {};\nwindow.dplReact.setToken("library", "fcd5c29a171f97b626d71eceffe1313f00a284b0")',
    },
  });

  // Get campaign.
  wiremock(baseUri, options).mappings.createMapping({
    request: {
      method: "GET",
      urlPath: "/dpl_campaign/match",
    },
    response: {
      "status": 404
    },
  });

  // Get availability.
  wiremock(baseUri, options).mappings.createMapping({
    request: {
      method: "GET",
      urlPattern: "/external/agencyid/catalog/availability/v3\\?recordid=.*"
    },
    response: {
      "transformers": ["response-template"],
      jsonBody: [{
        "recordId": "{{request.query.recordid}}",
        "reservable": "{{pickRandom true false}}",
        "available": "{{pickRandom true false}}",
        "reservations": "{{randomInt lower=0 upper=10}}"
      }],
    },
  });

};
