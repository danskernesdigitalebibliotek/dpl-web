// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.ts using ES2015 syntax:
import './commands';

// Alternatively you can use CommonJS syntax:
// require('./commands')

import 'cypress-plugin-api';

// Collect logs for the console.
import installLogsCollector from 'cypress-terminal-report/src/installLogsCollector';
installLogsCollector();

beforeEach(() => {
  cy.log('Setting cookie consent to Accept All');
  cy.setCookie(
    'CookieInformationConsent',
    encodeURIComponent(`{
      "timestamp": "2025-11-17T10:37:38.950Z",
      "consents_approved": [
        "cookie_cat_necessary",
        "cookie_cat_functional",
        "cookie_cat_statistic",
        "cookie_cat_marketing",
        "cookie_cat_unclassified"
      ],
      "consents_denied": [],
      "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:145.0) Gecko/20100101 Firefox/145.0"
    }`),
  );
});
