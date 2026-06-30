import { Options } from 'wiremock-rest-client/dist/model/options.model';
import wiremock from '../../lib/general';

export default async (baseUri?: string, options?: Options) => {
  // Get user info.
  await import('./data/fbi/patron.json').then((json) =>
    wiremock(baseUri, options).mappings.createMapping({
      // Persistent so it survives cy.resetMappings() (the login/session flow
      // resets mappings mid-suite; without this the FBI mocks vanish -> 404).
      persistent: true,
      request: {
        urlPattern: '/external/agencyid/patrons/patronid/v4',
      },
      response: {
        jsonBody: json,
      },
    })
  );

  // Get reservations.
  await import('./data/fbs/reservations.json').then((json) =>
    wiremock(baseUri, options).mappings.createMapping({
      // Persistent so it survives cy.resetMappings() (the login/session flow
      // resets mappings mid-suite; without this the FBI mocks vanish -> 404).
      persistent: true,
      request: {
        method: 'POST',
        urlPattern: '.*/patrons/patronid/reservations/.*',
      },
      response: {
        jsonBody: json.default,
      },
    })
  );
};
