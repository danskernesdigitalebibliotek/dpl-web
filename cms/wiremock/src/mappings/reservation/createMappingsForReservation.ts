import { Options } from 'wiremock-rest-client/dist/model/options.model';
import wiremock from '../../lib/general';

export default async (baseUri?: string, options?: Options) => {
  // Get user info.
  await import('./data/fbi/patron.json').then((json) =>
    wiremock(baseUri, options).mappings.createMapping({
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
