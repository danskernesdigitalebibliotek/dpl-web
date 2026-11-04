import { Options } from 'wiremock-rest-client/dist/model/options.model';
import { wiremock } from '../../lib/general';
import adresseDronningensgade531 from './data/adresse-dronningensgade-53-1.json';
import adresserSoegDronningensgade53 from './data/adresser-soeg-dronningensgade-53.json';
import adresserSoegDronningensgade531420 from './data/adresser-soeg-dronningensgade-53-1420.json';
import adresserSoegIshoej from './data/adresser-soeg-ishoej-store-torv-1-2635.json';
import husnummerIshoej from './data/husnummer-ishoej-store-torv-1.json';
import husnumreSoegDronningensgade53 from './data/husnumre-soeg-dronningensgade-53.json';
import husnumreSoegDronningensgade531420 from './data/husnumre-soeg-dronningensgade-53-1420.json';
import husnumreSoegIshoej from './data/husnumre-soeg-ishoej-store-torv-1-2635.json';

// Adressevælgeren, the Danish address register the dk_address module looks
// addresses up in. The responses in ./data are recorded from the real API, for
// the addresses the Cypress tests pick on the branch form.

// Searches, keyed by the text typed into the address widget. The widget queries
// both the house number and the address search, and merges the hits.
const searches = [
  {
    tekst: 'Ishøj Store Torv 1 2635',
    husnumre: husnumreSoegIshoej,
    adresser: adresserSoegIshoej,
  },
  {
    tekst: 'Dronningensgade 53',
    husnumre: husnumreSoegDronningensgade53,
    adresser: adresserSoegDronningensgade53,
  },
  // What the widget searches for when the editor opens the dwellings behind
  // the house number found above.
  {
    tekst: 'Dronningensgade 53, 1420 København K',
    husnumre: husnumreSoegDronningensgade531420,
    adresser: adresserSoegDronningensgade531420,
  },
];

// Id lookups, made when a hit is picked and when the form is saved.
const lookups = [
  {
    path: '/husnumre/0a3f507d-d12c-32b8-e044-0003ba298018',
    body: husnummerIshoej,
  },
  {
    path: '/adresser/416bbfb5-1ad3-4ae2-9296-b89ab178860c',
    body: adresseDronningensgade531,
  },
];

export default async (baseUri?: string, options?: Options) => {
  for (const search of searches) {
    for (const source of ['husnumre', 'adresser'] as const) {
      await wiremock(baseUri, options).mappings.createMapping({
        // Persistent so it survives cy.resetMappings().
        persistent: true,
        request: {
          method: 'GET',
          urlPath: `/${source}/soeg`,
          queryParameters: { tekst: { equalTo: search.tekst } },
        },
        response: { jsonBody: search[source] },
      });
    }
  }

  // Every other search finds nothing. Cypress types one character at a time,
  // and the widget searches for each prefix along the way.
  await wiremock(baseUri, options).mappings.createMapping({
    persistent: true,
    priority: 10,
    request: {
      method: 'GET',
      urlPathPattern: '/(husnumre|adresser)/soeg',
    },
    response: { jsonBody: { status: 'ok', beskrivelse: '', fund: [] } },
  });

  for (const lookup of lookups) {
    await wiremock(baseUri, options).mappings.createMapping({
      persistent: true,
      request: { method: 'GET', urlPath: lookup.path },
      response: { jsonBody: lookup.body },
    });
  }
};
