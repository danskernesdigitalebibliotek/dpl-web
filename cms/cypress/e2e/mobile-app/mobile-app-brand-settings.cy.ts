// The mobile apps show the library logo, which the BFF behind them reads
// through getAppBrandSettings. A failure here means a change in the CMS will
// break the mobile apps.
import { gqlQueries } from '../../helpers/mobile-app-queries';

// A 1x1 transparent PNG.
const png =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

const getBrandSettings = () =>
  cy.queryMobileAppGraphql<{ getAppBrandSettings: { logoUrl: string } }>(
    gqlQueries.GET_APP_BRAND_SETTINGS,
  );

const brandSettingsWithLogo = (fileName: string) => ({
  data: {
    getAppBrandSettings: {
      logoUrl: `${Cypress.config('baseUrl')}/sites/default/files/${fileName}`,
    },
  },
});

const uploadLogo = (fileName: string) => {
  cy.drupalLogin('/admin/appearance/settings/novel');
  cy.get('[name="default_logo"]').uncheck();
  cy.get('[name="files[logo_upload]"]').selectFile({
    contents: Cypress.Buffer.from(png, 'base64'),
    fileName,
    mimeType: 'image/png',
  });
  cy.get('[value="Save configuration"]').first().click();
  cy.contains('The configuration options have been saved.');
};

describe('Mobile app API: getAppBrandSettings', () => {
  it('returns the logo an editor uploads and replaces', () => {
    // The logo is global and the theme settings form offers no way to clear an
    // uploaded logo ("Use the logo supplied by the theme" leaves logo.path in
    // place), so the test uploads logos with names unique to each attempt
    // instead of cleaning up. Unique names also keep Drupal from renaming the
    // files, so the expected URLs are exact.
    const runId = Date.now();
    const firstLogo = `mobile-app-test-logo-${runId}-first.png`;
    const secondLogo = `mobile-app-test-logo-${runId}-second.png`;

    // The logo before the test depends on what ran before it, so we only know
    // what it is not.
    getBrandSettings().should(
      'not.deep.equal',
      brandSettingsWithLogo(firstLogo),
    );

    uploadLogo(firstLogo);
    getBrandSettings().should('deep.equal', brandSettingsWithLogo(firstLogo));

    uploadLogo(secondLogo);
    getBrandSettings().should('deep.equal', brandSettingsWithLogo(secondLogo));
  });
});
