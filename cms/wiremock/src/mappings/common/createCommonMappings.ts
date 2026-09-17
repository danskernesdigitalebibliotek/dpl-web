import { Options } from "wiremock-rest-client/dist/model/options.model";
import wiremock, { matchGraphqlQuery } from "../../lib/general";

export default async (baseUri?: string, options?: Options) => {
  // Mapping for covers.
  await wiremock(baseUri, options).mappings.createMapping({
    // Persistent so it survives cy.resetMappings() (the login/session flow
    // resets mappings mid-suite; without this the FBI mocks vanish -> 404).
    persistent: true,
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
  await wiremock(baseUri, options).mappings.createMapping({
    // Persistent so it survives cy.resetMappings() (the login/session flow
    // resets mappings mid-suite; without this the FBI mocks vanish -> 404).
    persistent: true,
    request: {
      method: "HEAD",
      urlPattern: "/list/default/.*",
    },
    response: {
      jsonBody: {},
    },
  });

  // Mapping for availability.
  await wiremock(baseUri, options).mappings.createMapping({
    // Persistent so it survives cy.resetMappings() (the login/session flow
    // resets mappings mid-suite; without this the FBI mocks vanish -> 404).
    persistent: true,
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
  await import("./data/fbs/getBranches.json").then((json) =>
    wiremock(baseUri, options).mappings.createMapping({
      // Persistent so it survives cy.resetMappings() (the login/session flow
      // resets mappings mid-suite; without this the FBI mocks vanish -> 404).
      persistent: true,
      request: {
        method: "GET",
        urlPattern: "/external/v1/agencyid/branches",
      },
      response: {
        jsonBody: json.default,
      },
    })
  );

  // Mappings for Adressevælgeren, the Danish address API. The dk_address
  // module calls it server-side: first the two searches when the editor types
  // in the address widget, then a lookup of the chosen id when the form is
  // saved. The responses are captured from the real API for the Ishøj address
  // used in branches.cy.ts. Persistent so they survive cy.resetMappings() from
  // other Cypress specs.
  const adressevaelgerMappings = [
    {
      urlPathPattern: "/husnumre/soeg",
      json: await import("./data/adressevaelger/husnumreSoeg.json"),
    },
    {
      urlPathPattern: "/adresser/soeg",
      json: await import("./data/adressevaelger/adresserSoeg.json"),
    },
    {
      urlPathPattern: "/husnumre/[0-9a-f-]{36}",
      json: await import("./data/adressevaelger/husnummer.json"),
    },
    {
      urlPathPattern: "/adresser/[0-9a-f-]{36}",
      json: await import("./data/adressevaelger/adresse.json"),
    },
  ];
  for (const { urlPathPattern, json } of adressevaelgerMappings) {
    await wiremock(baseUri, options).mappings.createMapping({
      persistent: true,
      request: {
        method: "GET",
        urlPathPattern,
      },
      response: {
        jsonBody: json.default,
      },
    });
  }

  // Mapings for autosuggest
  await import("../search/data/fbi/autosugggest.json").then((json) =>
    wiremock(baseUri, options).mappings.createMapping({
      // Persistent so it survives cy.resetMappings() (the login/session flow
      // resets mappings mid-suite; without this the FBI mocks vanish -> 404).
      persistent: true,
      request: {
        method: "POST",
        urlPathPattern: "/next.*/graphql",
        bodyPatterns: [
          {
            matchesJsonPath: matchGraphqlQuery("suggestionsFromQueryString"),
          },
        ],
      },
      response: {
        jsonBody: json.default,
      },
    })
  );
};
