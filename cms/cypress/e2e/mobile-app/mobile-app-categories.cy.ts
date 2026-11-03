// The mobile apps build their navigation from categories and their content
// elements, which the BFF behind them reads through getAppCategories. A
// failure here means a change in the CMS will break the mobile apps.
import { getNode } from '../../helpers/helper-node';
import { gqlQueries } from '../../helpers/mobile-app-queries';
import { GoArticleAddPage } from '../../pages/go-article-add';
import { GoCategoryAddPage } from '../../pages/go-category-add';
import { LoginPage } from '../../pages/login-page';
import {
  GoLinkboxParagraph,
  GoMaterialSliderAutomaticParagraph,
  GoMaterialSliderManualParagraph,
  GoTextBodyParagraph,
} from '../../pages/paragraphs';

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

const login = () =>
  LoginPage.ensureLogin(
    Cypress.env('DRUPAL_USERNAME'),
    Cypress.env('DRUPAL_PASSWORD'),
  );

const createGoArticle = (title: string) => {
  login();
  const articleAdd = new GoArticleAddPage();
  articleAdd.visitReturningToContent();
  articleAdd.fillTitle(title);
  articleAdd.selectTeaserImage('paige-cody');
  articleAdd.addParagraph(GoTextBodyParagraph).fillBody('<p>Brødtekst</p>');
  articleAdd.save();
  cy.contains(`GO Article ${title} has been created.`);
  return getNode(title);
};

// Starts a GO category with the fields every category needs.
const startGoCategory = (title: string) => {
  login();
  const categoryAdd = new GoCategoryAddPage();
  categoryAdd.visitReturningToContent();
  categoryAdd.fillTitle(title);
  categoryAdd.fillMenuTitle(title);
  categoryAdd.selectMenuImage('paige-cody');
  return categoryAdd;
};

const saveGoCategory = (categoryAdd: GoCategoryAddPage, title: string) => {
  categoryAdd.save();
  cy.contains(`GO category ${title} has been created.`);
  return getNode(title);
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

    createGoArticle(articleTitle).then((article) => {
      const categoryAdd = startGoCategory(categoryTitle);
      const linkbox = categoryAdd.addParagraph(GoLinkboxParagraph);
      linkbox.fillTitle(link.title);
      linkbox.fillDescription(link.description);
      // Required by the form, but the apps get the linkbox title instead.
      linkbox.fillLink(article.path, link.title);

      saveGoCategory(categoryAdd, categoryTitle).then((category) => {
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
      });
    });
  });

  it('returns a GO category with material sliders', () => {
    const runId = Date.now();
    const categoryTitle = `${titlePrefix} category ${runId}`;
    const automatic = {
      title: `Automatisk slider ${runId}`,
      cql: "term.title='Harry Potter'",
      limit: 12,
    };
    const manual = {
      title: `Manuel slider ${runId}`,
      workIds: ['work-of:870970-basis:22629344'],
    };

    const categoryAdd = startGoCategory(categoryTitle);

    const automaticSlider = categoryAdd.addParagraph(
      GoMaterialSliderAutomaticParagraph,
    );
    automaticSlider.fillTitle(automatic.title);
    automaticSlider.fillCql(automatic.cql);
    automaticSlider.fillAmount(automatic.limit);

    const manualSlider = categoryAdd.addParagraph(
      GoMaterialSliderManualParagraph,
    );
    manualSlider.fillTitle(manual.title);
    manualSlider.selectWork(manual.workIds[0]);

    saveGoCategory(categoryAdd, categoryTitle).then((category) => {
      getAppCategories('BIBLOGO', category.id).then(({ data }) => {
        const icon = data.getAppCategories[0]?.icon;

        expect(data).to.deep.equal({
          getAppCategories: [
            {
              id: category.id,
              title: categoryTitle,
              icon,
              elements: [
                {
                  __typename: 'AppContentElementGoMaterialSliderAutomatic',
                  id: category.paragraphs[0].id,
                  ...automatic,
                },
                {
                  __typename: 'AppContentElementGoMaterialSliderManual',
                  id: category.paragraphs[1].id,
                  ...manual,
                },
              ],
            },
          ],
        });
      });
    });
  });

  it('lists a category created after the list was cached', () => {
    const runId = Date.now();
    const articleTitle = `${titlePrefix} cached article ${runId}`;
    const categoryTitle = `${titlePrefix} cached category ${runId}`;

    // Reading the list caches it, so the list must be invalidated when the
    // category is created for the category to show up.
    getAppCategories('BIBLOGO');

    createGoArticle(articleTitle, '<p>Brødtekst</p>').then((article) => {
      createGoCategory(categoryTitle, {
        title: `Linkbox ${runId}`,
        description: `Beskrivelse ${runId}`,
        linkPath: article.path,
      }).then((category) => {
        getAppCategories('BIBLOGO').then(({ data }) => {
          const ids = data.getAppCategories.map(({ id }) => id);
          expect(ids).to.include(category.id);
        });
      });
    });
  });
});
