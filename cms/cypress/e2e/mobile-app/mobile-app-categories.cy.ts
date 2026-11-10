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

type Linkbox = {
  title: string;
  description: string;
  linkPath: string;
  linkTitle: string;
};

const addGoLinkbox = (categoryAdd: GoCategoryAddPage, link: Linkbox) => {
  const linkbox = categoryAdd.addParagraph(GoLinkboxParagraph);
  linkbox.fillTitle(link.title);
  linkbox.fillDescription(link.description);
  linkbox.fillLink(link.linkPath, link.linkTitle);
};

// Both the categories and the articles they link to.
const titlePrefix = 'Mobile app test GO';

describe('Mobile app API: getAppCategories', () => {
  before(() => {
    cy.deleteEntitiesIfExists(titlePrefix);
  });

  beforeEach(() => {
    LoginPage.ensureEditorLogin();
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
      linkTitle: `Link ${runId}`,
    };

    GoArticleAddPage.add(articleTitle).save();
    cy.contains(`GO Article ${articleTitle} has been created.`);

    getNode(articleTitle).then((article) => {
      const categoryAdd = GoCategoryAddPage.add(categoryTitle);
      addGoLinkbox(categoryAdd, { ...link, linkPath: article.path });

      categoryAdd.save();
      cy.contains(`GO category ${categoryTitle} has been created.`);

      getNode(categoryTitle).then((category) => {
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
                    linkTitle: link.linkTitle,
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

    const categoryAdd = GoCategoryAddPage.add(categoryTitle);

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

    categoryAdd.save();
    cy.contains(`GO category ${categoryTitle} has been created.`);

    getNode(categoryTitle).then((category) => {
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

    GoArticleAddPage.add(articleTitle).save();
    cy.contains(`GO Article ${articleTitle} has been created.`);

    getNode(articleTitle).then((article) => {
      const categoryAdd = GoCategoryAddPage.add(categoryTitle);
      addGoLinkbox(categoryAdd, {
        title: `Linkbox ${runId}`,
        description: `Beskrivelse ${runId}`,
        linkPath: article.path,
        linkTitle: `Link ${runId}`,
      });

      categoryAdd.save();
      cy.contains(`GO category ${categoryTitle} has been created.`);

      getNode(categoryTitle).then((category) => {
        getAppCategories('BIBLOGO').then(({ data }) => {
          const ids = data.getAppCategories.map(({ id }) => id);
          expect(ids).to.include(category.id);
        });
      });
    });
  });
});
