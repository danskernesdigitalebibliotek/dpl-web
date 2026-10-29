// The mobile apps show pages and articles with their content elements, which
// the BFF behind them reads through getAppPage. A failure here means a change
// in the CMS will break the mobile apps.
import { typeInCkEditor } from '../../helpers/helper-ckeditor';
import { createGoArticle } from '../../helpers/helper-go-content';
import { getNode } from '../../helpers/helper-node';
import {
  addParagraph,
  appendParagraph,
  paragraphField,
  setWorkId,
} from '../../helpers/helper-paragraph';
import { gqlQueries } from '../../helpers/mobile-app-queries';

type AppContentElement = { __typename: string; id: string } & Record<
  string,
  unknown
>;

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
const pageTitlePrefix = 'Mobile app test page';

// Creates a page, which the Biblo apps show, with the paragraphs added by
// addParagraphs.
const createPage = (
  title: string,
  subtitle: string,
  addParagraphs?: () => void,
) => {
  cy.drupalLogin('/node/add/page');
  cy.findByLabelText('Title').type(title);
  // The subtitle field is hidden until the titles are displayed.
  cy.findByLabelText('Display titles').check();
  cy.findByLabelText('Subtitle').type(subtitle);
  if (addParagraphs) {
    cy.openParagraphsModal();
    addParagraphs();
  }
  cy.clickSaveButton();
  cy.contains(`Page ${title} has been created.`);
  return getNode(title);
};

describe('Mobile app API: getAppPage', () => {
  before(() => {
    cy.deleteEntitiesIfExists(titlePrefix);
    cy.deleteEntitiesIfExists(pageTitlePrefix);
  });

  after(() => {
    cy.deleteEntitiesIfExists(titlePrefix);
    cy.deleteEntitiesIfExists(pageTitlePrefix);
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

  it('returns the elements of a page', () => {
    const runId = Date.now();
    const title = `${pageTitlePrefix} ${runId}`;
    const subtitle = `Undertitel ${runId}`;
    const linkedTitle = `${pageTitlePrefix} linked ${runId}`;
    const body = '<p>Brødtekst med <strong>fed</strong>.</p>';
    const recommendation = {
      imagePositionRight: true,
      nullableTitle: `Anbefaling ${runId}`,
      nullableDescription: `Anbefalingsbeskrivelse ${runId}`,
      workId: 'work-of:870970-basis:22629344',
    };
    const gridAutomatic = {
      nullableTitle: `Automatisk grid ${runId}`,
      nullableDescription: `Automatisk beskrivelse ${runId}`,
      cql: "term.title='Harry Potter'",
      limit: 12,
      priorityMaterialType: 'bog',
    };
    const gridManual = {
      nullableTitle: `Manuelt grid ${runId}`,
      nullableDescription: `Manuel beskrivelse ${runId}`,
      workIds: ['work-of:870970-basis:22629344'],
    };

    // The page the navigation spots link to.
    createPage(linkedTitle, subtitle).then((linkedPage) => {
      createPage(title, subtitle, () => {
        addParagraph('Text body');
        typeInCkEditor(body);

        const recommendationFields = paragraphField(1);
        appendParagraph('Recommendation');
        cy.get(
          `${recommendationFields}[field_image_position_right][value]"]`,
        ).check();
        cy.get(
          `${recommendationFields}[field_recommendation_title][0][value]"]`,
        ).type(recommendation.nullableTitle);
        cy.get(
          `${recommendationFields}[field_recommendation_description][0][value]"]`,
        ).type(recommendation.nullableDescription);
        setWorkId(
          `${recommendationFields}[field_recommendation_work_id][0][fields_container][value]"]`,
          recommendation.workId,
        );

        appendParagraph('Navigation spots - manual');
        cy.get(
          `${paragraphField(2)}[field_nav_spots_content][0][target_id]"]`,
        ).type(linkedTitle);

        const gridAutomaticFields = paragraphField(3);
        appendParagraph('Material grid automatic');
        cy.get(
          `${gridAutomaticFields}[field_material_grid_title][0][value]"]`,
        ).type(gridAutomatic.nullableTitle);
        cy.get(
          `${gridAutomaticFields}[field_material_grid_description][0][value]"]`,
        ).type(gridAutomatic.nullableDescription);
        cy.get(
          `${gridAutomaticFields}[field_cql_search][0][filters][cql]"]`,
        ).type(gridAutomatic.cql, { delay: 0 });
        cy.get(
          `${gridAutomaticFields}[field_material_amount][0][value]"]`,
        ).type(`{selectall}${gridAutomatic.limit}`);
        cy.get(`${gridAutomaticFields}[field_priority_material_type]"]`).select(
          gridAutomatic.priorityMaterialType,
        );

        const gridManualFields = paragraphField(4);
        appendParagraph('Material grid manual');
        cy.get(
          `${gridManualFields}[field_material_grid_title][0][value]"]`,
        ).type(gridManual.nullableTitle);
        cy.get(
          `${gridManualFields}[field_material_grid_description][0][value]"]`,
        ).type(gridManual.nullableDescription);
        setWorkId(
          `${gridManualFields}[field_material_grid_work_ids][0][fields_container][value]"]`,
          gridManual.workIds[0],
        );
      }).then((page) => {
        getAppPage(page.id).then(({ data }) => {
          const ids = page.paragraphs.map(({ id }) => id);

          expect(data).to.deep.equal({
            getAppPage: {
              title,
              subtitle,
              image: null,
              elements: [
                { __typename: 'AppContentElementText', id: ids[0], body },
                {
                  __typename: 'AppContentElementRecommendation',
                  id: ids[1],
                  ...recommendation,
                },
                {
                  __typename: 'AppContentElementNavSpotsManual',
                  id: ids[2],
                  linkedPages: [linkedPage.id],
                },
                {
                  __typename: 'AppContentElementMaterialGridAutomatic',
                  id: ids[3],
                  ...gridAutomatic,
                },
                {
                  __typename: 'AppContentElementMaterialGridManual',
                  id: ids[4],
                  ...gridManual,
                },
              ],
            },
          });
        });
      });
    });
  });
});
