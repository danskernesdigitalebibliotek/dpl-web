// The mobile apps build their navigation from categories and their content
// elements, which the BFF behind them reads through getAppCategories. A
// failure here means a change in the CMS will break the mobile apps.
import {
  createGoArticle,
  getGoNode,
  openGoNodeForm,
} from '../../helpers/helper-go-content';
import { mediaLibrarySelect } from '../../helpers/helper-media';
import { addParagraph } from '../../helpers/helper-paragraph';
import { gqlQueries } from '../../helpers/mobile-app-queries';

type AppCategory = {
  id: string;
  title: string;
  icon: string;
  elements: Record<string, unknown>[];
};

const getAppCategories = (type: string, id?: string) =>
  cy.queryMobileAppGraphql<{ getAppCategories: AppCategory[] }>(
    gqlQueries.GET_APP_CATEGORIES,
    { type, id },
  );

type Linkbox = { title: string; description: string; linkPath: string };

const linkbox = '[name^="field_paragraphs[0][subform]';

const createGoCategory = (title: string, link: Linkbox) => {
  openGoNodeForm('go_category');
  cy.findByLabelText('Title').type(title);
  cy.findByLabelText('Category menu title').type(title);
  mediaLibrarySelect(
    '#field_category_menu_image-media-library-wrapper',
    'paige-cody',
  );
  cy.openParagraphsModal();
  addParagraph('GO Linkbox');
  cy.get(`${linkbox}[field_title][0][value]"]`).type(link.title);
  cy.get(`${linkbox}[field_go_description][0][value]"]`).type(link.description);
  // The linkbox links through a GO link paragraph, which the form adds for us.
  const goLink = `${linkbox}[field_go_link_paragraph][0][subform][field_go_link][0]`;
  cy.get(`${goLink}[uri]"]`).type(link.linkPath);
  // Required by the form, but the apps get the linkbox title instead.
  cy.get(`${goLink}[title]"]`).type(link.title);
  cy.clickSaveButton();
  cy.contains(`GO category ${title} has been created.`);
  return getGoNode(title);
};

// Both the categories and the articles they link to.
const titlePrefix = 'Mobile app test GO';

describe('Mobile app API: getAppCategories', () => {
  before(() => {
    cy.deleteEntitiesIfExists(titlePrefix);
  });

  after(() => {
    cy.deleteEntitiesIfExists(titlePrefix);
  });

  it('returns a GO category with a linkbox to a GO article', () => {
    // Titles unique to the run, so leftovers from an earlier run cannot make
    // the test pass.
    const runId = Date.now();
    const articleTitle = `${titlePrefix} article ${runId}`;
    const categoryTitle = `${titlePrefix} category ${runId}`;
    const link = {
      title: `Linkbox ${runId}`,
      description: `Beskrivelse ${runId}`,
    };

    // Reading the list before creating the category caches it, so a list
    // that is not invalidated when a category is created fails the test.
    getAppCategories('BIBLOGO');

    createGoArticle(articleTitle, '<p>Brødtekst</p>').then((article) => {
      createGoCategory(categoryTitle, { ...link, linkPath: article.path }).then(
        (category) => {
          // The apps list all categories first and then ask for each one.
          getAppCategories('BIBLOGO').then(({ data }) => {
            const ids = data.getAppCategories.map(({ id }) => id);
            expect(ids).to.include(category.id);
          });

          getAppCategories('BIBLOGO', category.id).then(({ data }) => {
            // The icon URL contains the upload date, so we only know which
            // file it is. The apps cannot resolve relative URLs, so it must
            // be absolute.
            const icon = data.getAppCategories[0]?.icon;
            expect(icon).to.match(
              new RegExp(`^${Cypress.config('baseUrl')}/.*paige-cody`),
            );

            // The GO app opens the linked article by passing contentId to
            // getAppPage, see mobile-app-page.cy.ts.
            expect(data).to.deep.equal({
              getAppCategories: [
                {
                  id: category.id,
                  title: categoryTitle,
                  icon,
                  elements: [
                    {
                      __typename: 'AppContentElementGoLinkbox',
                      id: category.paragraphs[0].id,
                      title: link.title,
                      color: null,
                      description: link.description,
                      image: null,
                      contentId: article.id,
                    },
                  ],
                },
              ],
            });
          });
        },
      );
    });
  });
});
