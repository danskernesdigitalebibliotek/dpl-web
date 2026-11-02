// The mobile apps show pages and articles with their content elements, which
// the BFF behind them reads through getAppPage. A failure here means a change
// in the CMS will break the mobile apps.
import { getNode } from '../../helpers/helper-node';
import { gqlQueries } from '../../helpers/mobile-app-queries';
import { GoArticleAddPage } from '../../pages/go-article-add';
import { LoginPage } from '../../pages/login-page';
import { PageAddPage } from '../../pages/page-add';
import {
  GoTextBodyParagraph,
  MaterialGridAutomaticParagraph,
  MaterialGridManualParagraph,
  NavSpotsManualParagraph,
  RecommendationParagraph,
  TextBodyParagraph,
} from '../../pages/paragraphs';

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

const login = () =>
  LoginPage.ensureLogin(
    Cypress.env('DRUPAL_USERNAME'),
    Cypress.env('DRUPAL_PASSWORD'),
  );

// Starts a page, which the Biblo apps show, with the fields every page needs.
const startPage = (title: string, subtitle: string) => {
  login();
  const pageAdd = new PageAddPage();
  pageAdd.visit([]);
  pageAdd.fillTitle(title);
  pageAdd.fillSubtitle(subtitle);
  return pageAdd;
};

const savePage = (pageAdd: PageAddPage, title: string) => {
  pageAdd.save();
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

    login();
    const articleAdd = new GoArticleAddPage();
    articleAdd.visitReturningToContent();
    articleAdd.fillTitle(title);
    articleAdd.selectTeaserImage('paige-cody');
    articleAdd.addParagraph(GoTextBodyParagraph).fillBody(body);
    articleAdd.save();
    cy.contains(`GO Article ${title} has been created.`);

    getNode(title).then((article) => {
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
    const linkedPageAdd = startPage(linkedTitle, subtitle);
    savePage(linkedPageAdd, linkedTitle).then((linkedPage) => {
      const pageAdd = startPage(title, subtitle);

      pageAdd.addParagraph(TextBodyParagraph).fillBody(body);

      const recommendationParagraph = pageAdd.addParagraph(
        RecommendationParagraph,
      );
      recommendationParagraph.placeImageRight();
      recommendationParagraph.fillTitle(recommendation.nullableTitle);
      recommendationParagraph.fillDescription(
        recommendation.nullableDescription,
      );
      recommendationParagraph.selectWork(recommendation.workId);

      pageAdd.addParagraph(NavSpotsManualParagraph).linkContent(linkedTitle);

      const gridAutomaticParagraph = pageAdd.addParagraph(
        MaterialGridAutomaticParagraph,
      );
      gridAutomaticParagraph.fillTitle(gridAutomatic.nullableTitle);
      gridAutomaticParagraph.fillDescription(gridAutomatic.nullableDescription);
      gridAutomaticParagraph.fillCql(gridAutomatic.cql);
      gridAutomaticParagraph.fillAmount(gridAutomatic.limit);
      gridAutomaticParagraph.selectPriorityMaterialType(
        gridAutomatic.priorityMaterialType,
      );

      const gridManualParagraph = pageAdd.addParagraph(
        MaterialGridManualParagraph,
      );
      gridManualParagraph.fillTitle(gridManual.nullableTitle);
      gridManualParagraph.fillDescription(gridManual.nullableDescription);
      gridManualParagraph.selectWork(gridManual.workIds[0]);

      savePage(pageAdd, title).then((page) => {
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
