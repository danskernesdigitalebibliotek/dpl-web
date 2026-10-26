// The mobile apps link to the fees page and the payment site, which the BFF
// behind them reads through getAppFeesAndPaymentInfo. A failure here means a
// change in the CMS will break the mobile apps.
import { gqlQueries } from '../../helpers/mobile-app-queries';

type FeesAndPaymentInfo = {
  feesAndReplacementCostsUrl: string | null;
  paymentSiteUrl: string | null;
  paymentSiteButtonLabel: string | null;
};

type FeesSettings = {
  feesAndReplacementCostsUrl: string;
  paymentSiteUrl: string;
  paymentSiteButtonLabel: string;
};

const formUrl = '/admin/config/dpl-library-agency/fees';
const fields: Record<keyof FeesSettings, string> = {
  feesAndReplacementCostsUrl: '[name="fees_and_replacement_costs_url"]',
  paymentSiteUrl: '[name="payment_site_url"]',
  paymentSiteButtonLabel: '[name="payment_site_button_label"]',
};

const getFeesAndPaymentInfo = () =>
  cy.queryMobileAppGraphql<{ getAppFeesAndPaymentInfo: FeesAndPaymentInfo }>(
    gqlQueries.GET_APP_FEES_AND_PAYMENT_INFO,
  );

const responseWith = (info: FeesAndPaymentInfo) => ({
  data: { getAppFeesAndPaymentInfo: info },
});

// The URL fields use Linkit autocomplete. Setting the values directly keeps
// its suggestions from getting in the way.
const setFeesSettings = (settings: FeesSettings) => {
  cy.drupalLogin(formUrl);
  (Object.keys(fields) as (keyof FeesSettings)[]).forEach((key) => {
    cy.get(fields[key]).invoke('val', settings[key]);
  });
  cy.get('[value="Save configuration"]').first().click();
  cy.contains('The configuration options have been saved.');
};

// Linkit's autocomplete script throws on the URL fields of this form, as it
// expects to find them in a link field widget. Saving the form still works.
Cypress.on(
  'uncaught:exception',
  (error) =>
    !error.message.includes(
      'must have a data-drupal-selector attribute ending in "-uri"',
    ),
);

describe('Mobile app API: getAppFeesAndPaymentInfo', () => {
  // When no fees URL is set, the form shows the site's base URL, so restoring
  // saves the base URL. The apps get the same URL either way.
  const original: FeesSettings = {
    feesAndReplacementCostsUrl: '',
    paymentSiteUrl: '',
    paymentSiteButtonLabel: '',
  };

  before(() => {
    cy.drupalLogin(formUrl);
    (Object.keys(fields) as (keyof FeesSettings)[]).forEach((key) => {
      cy.get(fields[key])
        .invoke('val')
        .then((value) => {
          original[key] = String(value);
        });
    });
  });

  after(() => {
    setFeesSettings(original);
  });

  it('returns the fees page and payment site an editor sets', () => {
    // Values unique to the run, so leftovers from an earlier run cannot make
    // the test pass.
    const runId = Date.now();
    const feesPath = `/mobile-app-test-fees-${runId}`;
    const paymentSiteUrl = `https://example.com/mobile-app-test-pay-${runId}`;
    const paymentSiteButtonLabel = `Betal ${runId}`;

    setFeesSettings({
      feesAndReplacementCostsUrl: feesPath,
      paymentSiteUrl,
      paymentSiteButtonLabel,
    });
    // The apps cannot resolve relative URLs, so they must come back absolute.
    const feesUrl = `${Cypress.config('baseUrl')}${feesPath}`;
    getFeesAndPaymentInfo().should(
      'deep.equal',
      responseWith({
        feesAndReplacementCostsUrl: feesUrl,
        paymentSiteUrl,
        paymentSiteButtonLabel,
      }),
    );

    // Without a payment site the apps hide the payment button.
    setFeesSettings({
      feesAndReplacementCostsUrl: feesPath,
      paymentSiteUrl: '',
      paymentSiteButtonLabel: '',
    });
    // CI does not import translations, so the label falls back to the English
    // source string.
    getFeesAndPaymentInfo().should(
      'deep.equal',
      responseWith({
        feesAndReplacementCostsUrl: feesUrl,
        paymentSiteUrl: null,
        paymentSiteButtonLabel: 'Go to payment page',
      }),
    );
  });
});
