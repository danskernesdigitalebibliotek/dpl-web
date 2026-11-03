// The mobile apps show pages and articles with their content elements, which
// the BFF behind them reads through getAppPage. A failure here means a change
// in the CMS will break the mobile apps.
import { createGoArticle } from '../../helpers/helper-go-content';
import { gqlQueries } from '../../helpers/mobile-app-queries';

type AppContentElement = { __typename: string; id: string; body?: string };

type AppPage = {
  title: string;
  subtitle: string | null;
  image: string | null;
  elements: AppContentElement[];
};

const getAppPage = (id: string) =>
  cy.queryMobileAppGraphql<{ getAppPage: AppPage | null }>(
    gqlQueries.GET_APP_PAGE,
    { id },
  );

const titlePrefix = 'Mobile app test GO article';

describe('Mobile app API: getAppPage', () => {
  before(() => {
    cy.deleteEntitiesIfExists(titlePrefix);
  });

  after(() => {
    cy.deleteEntitiesIfExists(titlePrefix);
  });

  it('returns the GO Text Body of a GO article', () => {
    // A title unique to the run, so leftovers from an earlier run cannot make
    // the test pass.
    const title = `${titlePrefix} ${Date.now()}`;
    // The formatting the GO Text Body format allows editors to use.
    const body =
      '<h2>Overskrift</h2>' +
      '<p><strong>Fed</strong>, <em>kursiv</em> og <a href="https://example.com/">et link</a>.</p>' +
      '<ul><li>Punkt</li></ul>';

    createGoArticle(title, body).then((article) => {
      getAppPage(article.id).then(({ data }) => {
        // The image URL contains the upload date, so we only know which file
        // it is. The apps cannot resolve relative URLs, so it must be absolute.
        const { image } = data.getAppPage ?? {};
        expect(image).to.match(
          new RegExp(`^${Cypress.config('baseUrl')}/.*paige-cody`),
        );

        expect(data).to.deep.equal({
          getAppPage: {
            title,
            subtitle: null,
            image,
            elements: [
              {
                __typename: 'AppContentElementText',
                id: article.paragraphs[0].id,
                body,
              },
            ],
          },
        });
      });
    });
  });
});
