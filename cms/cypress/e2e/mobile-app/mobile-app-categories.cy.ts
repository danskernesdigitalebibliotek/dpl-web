// The mobile apps build their navigation from categories and their content
// elements, which the BFF behind them reads through getAppCategories. A
// failure here means a change in the CMS will break the mobile apps.
import {
  createGoArticle,
  openGoNodeForm,
} from '../../helpers/helper-go-content';
import { mediaLibrarySelect } from '../../helpers/helper-media';
import {
  getNode,
  openNodeEditForm,
  setNodePublished,
} from '../../helpers/helper-node';
import {
  addParagraph,
  appendParagraph,
  paragraphField,
  setWorkId,
} from '../../helpers/helper-paragraph';
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

const addGoLinkbox = (link: Linkbox) => {
  const linkbox = paragraphField(0);
  addParagraph('GO Linkbox');
  cy.get(`${linkbox}[field_title][0][value]"]`).type(link.title);
  cy.get(`${linkbox}[field_go_description][0][value]"]`).type(link.description);
  // The linkbox links through a GO link paragraph, which the form adds for us.
  const goLink = `${linkbox}[field_go_link_paragraph][0][subform][field_go_link][0]`;
  cy.get(`${goLink}[uri]"]`).type(link.linkPath);
  // Required by the form, but the apps get the linkbox title instead.
  cy.get(`${goLink}[title]"]`).type(link.title);
};

const createGoCategory = (title: string, addParagraphs: () => void) => {
  openGoNodeForm('go_category');
  cy.findByLabelText('Title').type(title);
  cy.findByLabelText('Category menu title').type(title);
  mediaLibrarySelect(
    '#field_category_menu_image-media-library-wrapper',
    'paige-cody',
  );
  cy.openParagraphsModal();
  addParagraphs();
  cy.clickSaveButton();
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

    createGoArticle(articleTitle, '<p>Brødtekst</p>').then((article) => {
      createGoCategory(categoryTitle, () =>
        addGoLinkbox({ ...link, linkPath: article.path }),
      ).then((category) => {
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

    createGoCategory(categoryTitle, () => {
      const automaticSlider = paragraphField(0);
      addParagraph('GO Material Slider - Automatic');
      cy.get(`${automaticSlider}[field_title][0][value]"]`).type(
        automatic.title,
      );
      cy.get(`${automaticSlider}[field_cql_search][0][filters][cql]"]`).type(
        automatic.cql,
        { delay: 0 },
      );
      cy.get(
        `${automaticSlider}[field_slider_amount_of_materials][0][value]"]`,
      ).type(`{selectall}${automatic.limit}`);

      const manualSlider = paragraphField(1);
      appendParagraph('GO Material Slider - Manual');
      cy.get(`${manualSlider}[field_title][0][value]"]`).type(manual.title);
      setWorkId(
        `${manualSlider}[field_material_slider_work_ids][0][fields_container][value]"]`,
        manual.workIds[0],
      );
    }).then((category) => {
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

  it('reflects an editor updating, unpublishing and deleting a GO category', () => {
    const runId = Date.now();
    const category = {
      title: `${titlePrefix} category ${runId}`,
      sliderTitle: `Slider ${runId}`,
    };
    const updatedCategory = {
      title: `${titlePrefix} category updated ${runId}`,
      sliderTitle: `Ny slider ${runId}`,
    };
    const slider = paragraphField(0);
    const sliderTitleField = `${slider}[field_title][0][value]"]`;
    const cql = "term.title='Harry Potter'";

    createGoCategory(category.title, () => {
      addParagraph('GO Material Slider - Automatic');
      cy.get(sliderTitleField).type(category.sliderTitle);
      cy.get(`${slider}[field_cql_search][0][filters][cql]"]`).type(cql, {
        delay: 0,
      });
    }).then(({ id, paragraphs }) => {
      // The apps list all categories first and then ask for each one.
      const getListedIds = () =>
        getAppCategories('BIBLOGO').then(({ data }) =>
          data.getAppCategories.map((listed) => listed.id),
        );
      // The icon is covered by the other tests.
      const assertCategory = ({ title, sliderTitle }: typeof category) =>
        getAppCategories('BIBLOGO', id).then(({ data }) => {
          const [listed] = data.getAppCategories;
          expect(listed).to.deep.equal({
            id,
            title,
            icon: listed?.icon,
            elements: [
              {
                __typename: 'AppContentElementGoMaterialSliderAutomatic',
                id: paragraphs[0].id,
                title: sliderTitle,
                cql,
                limit: null,
              },
            ],
          });
        });

      // Reading the category before changing it caches it, so a response that
      // is not invalidated fails the test.
      getListedIds().should('include', id);
      assertCategory(category);

      openNodeEditForm(category.title);
      cy.findByLabelText('Title').clear();
      cy.findByLabelText('Title').type(updatedCategory.title);
      cy.get(sliderTitleField).clear();
      cy.get(sliderTitleField).type(updatedCategory.sliderTitle);
      cy.clickSaveButton();
      cy.contains(`GO category ${updatedCategory.title} has been updated.`);
      assertCategory(updatedCategory);

      setNodePublished(updatedCategory.title, false);
      getListedIds().should('not.include', id);
      getAppCategories('BIBLOGO', id)
        .its('data')
        .should('deep.equal', { getAppCategories: [] });

      setNodePublished(updatedCategory.title, true);
      getListedIds().should('include', id);
      assertCategory(updatedCategory);

      cy.deleteEntitiesIfExists(updatedCategory.title);
      getListedIds().should('not.include', id);
      getAppCategories('BIBLOGO', id)
        .its('data')
        .should('deep.equal', { getAppCategories: [] });
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
