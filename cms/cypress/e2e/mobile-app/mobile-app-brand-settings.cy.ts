// The mobile apps show the library logo, which the BFF behind them reads
// through getAppBrandSettings. A failure here means a change in the CMS will
// break the mobile apps.
import { gqlQueries } from '../../helpers/mobile-app-queries';

type BrandSettings = { logoUrl: string | null };

// A 1x1 transparent PNG.
const png =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

const getBrandSettings = () =>
  cy
    .queryMobileAppGraphql<{ getAppBrandSettings: BrandSettings }>(
      gqlQueries.GET_APP_BRAND_SETTINGS,
    )
    .then((data) => data.getAppBrandSettings);

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
  // The logo is global and the theme settings form offers no way to clear an
  // uploaded logo ("Use the logo supplied by the theme" leaves logo.path in
  // place), so the test uploads logos with names unique to the run instead of
  // cleaning up.
  const runId = Date.now();
  const firstLogo = `mobile-app-test-logo-${runId}-first.png`;
  const secondLogo = `mobile-app-test-logo-${runId}-second.png`;

  it('returns the logo an editor uploads and replaces', () => {
    getBrandSettings().then(({ logoUrl }) => {
      expect(logoUrl).to.match(/^https?:\/\//);
      expect(logoUrl).not.to.include(firstLogo);
    });

    uploadLogo(firstLogo);
    getBrandSettings().then(({ logoUrl }) => {
      expect(logoUrl).to.match(/^https?:\/\//);
      expect(logoUrl).to.include(firstLogo);
    });

    uploadLogo(secondLogo);
    getBrandSettings().then(({ logoUrl }) => {
      expect(logoUrl).to.match(/^https?:\/\//);
      expect(logoUrl).to.include(secondLogo);
    });
  });
});
