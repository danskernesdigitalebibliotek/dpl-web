import {
  DashboardPage,
  dashboardStory
} from "../../../cypress/page-objects/dashboard/DashboardPage";
import {
  biblioAudiobookLoanFactory,
  biblioLoanFactory,
  biblioSplitLoanQuotaFactory
} from "../../../cypress/factories/biblio/biblio.factory";
import {
  givenUserHasBiblioLoanQuotas,
  givenUserHasBiblioLoans,
  givenUserHasNoBiblioReservations
} from "../../../cypress/intercepts/biblio/biblio";
import { givenCatalogueKnowsNothing } from "../../../cypress/intercepts/fbi/catalogueDetails";
import { interceptPublizonCalls } from "../../../cypress/intercepts/publizon/interceptPublizonCalls";
import {
  GeneralMaterialTypeCodeEnum,
  GetDashboardBlueRecommendationsQuery
} from "../../core/dbc-gateway/generated/graphql";

/**
 * Blue titles - those that can always be loaned - are suggested per format
 * once the patron holds as many digital loans in it as they may at once.
 */

const EBOOK_ISBNS = ["9780000000011", "9780000000012", "9780000000013"];
const AUDIOBOOK_ISBNS = ["9780000000021", "9780000000022", "9780000000023"];

// Each loan's ISBN resolves to its own work.
const workIdForIsbn = (isbn: string) => `work-of:870970-basis:${isbn}`;

type Recommendation =
  GetDashboardBlueRecommendationsQuery["first"]["result"][number];

type ManifestationFixture = {
  code: GeneralMaterialTypeCodeEnum;
  display: string;
  canAlwaysBeLoaned: boolean;
};

const recommendedWork = (
  workId: string,
  title: string,
  manifestation: ManifestationFixture
): Recommendation => ({
  work: {
    workId,
    titles: { full: [title] },
    creators: [{ display: "Forfatter" }],
    manifestations: {
      bestRepresentation: { cover: { large: null } },
      all: [
        {
          materialTypes: [
            {
              materialTypeGeneral: { code: manifestation.code },
              materialTypeSpecific: { display: manifestation.display }
            }
          ],
          access: [
            {
              __typename: "Ereol",
              canAlwaysBeLoaned: manifestation.canAlwaysBeLoaned
            }
          ]
        }
      ]
    }
  }
});

const blueEbook = recommendedWork("work-of:blue-ebook", "Blå e-bog", {
  code: GeneralMaterialTypeCodeEnum.Ebooks,
  display: "e-bog",
  canAlwaysBeLoaned: true
});
const blueAudiobook = recommendedWork("work-of:blue-audiobook", "Blå lydbog", {
  code: GeneralMaterialTypeCodeEnum.AudioBooks,
  display: "lydbog (online)",
  canAlwaysBeLoaned: true
});
const quotaEbook = recommendedWork("work-of:quota-ebook", "Kvote-e-bog", {
  code: GeneralMaterialTypeCodeEnum.Ebooks,
  display: "e-bog",
  canAlwaysBeLoaned: false
});

const stubBackends = () => {
  cy.createFakeAuthenticatedSession();
  cy.createFakeLibrarySession();

  cy.intercept("GET", "**/external/agencyid/patron/patronid/fees/v2**", {
    statusCode: 200,
    body: []
  });
  // The blocked-patron HOC fetches the patron record before the dashboard
  // renders.
  cy.intercept("GET", "**/external/agencyid/patrons/patronid/v4**", {
    statusCode: 200,
    body: { patron: { blockStatus: null } }
  });
  // Nothing physical, nothing in Publizon and no favorites: every loan is a
  // Biblio loan.
  cy.intercept("GET", "**/external/agencyid/patrons/patronid/loans/v2**", {
    statusCode: 200,
    body: []
  });
  cy.intercept(
    "GET",
    "**/external/v1/agencyid/patrons/patronid/reservations/v2**",
    { statusCode: 200, body: [] }
  );
  interceptPublizonCalls();
  cy.intercept("GET", "**/list/default**", {
    statusCode: 200,
    body: { id: "default", collections: [] }
  });
  givenUserHasNoBiblioReservations();
  givenCatalogueKnowsNothing();

  cy.intercept(
    "POST",
    "**/graphql?getDashboardRecommendationSourceByIsbn",
    (request) => {
      const isbn = /term\.isbn=(\d+)/.exec(request.body.variables.cql)?.[1];
      request.reply({
        statusCode: 200,
        body: {
          data: {
            complexSearch: {
              works: isbn
                ? [
                    {
                      workId: workIdForIsbn(isbn),
                      titles: { full: [`Lån ${isbn}`] }
                    }
                  ]
                : []
            }
          }
        }
      });
    }
  ).as("recommendationSourceByIsbn");

  // The regular recommendations have nothing, so the only sliders on the page
  // are the blue ones.
  cy.intercept("POST", "**/graphql?getDashboardRecommendations", {
    statusCode: 200,
    body: { data: { recommend: { result: [] } } }
  }).as("recommend");

  // Every seed gets a mix: blue titles in each format, one that draws on the
  // quota, and a work two seeds both recommend.
  cy.intercept("POST", "**/graphql?getDashboardBlueRecommendations", {
    statusCode: 200,
    body: {
      data: {
        first: { result: [blueEbook, quotaEbook] },
        second: { result: [blueAudiobook] },
        third: { result: [blueEbook] }
      }
    }
  }).as("blueRecommendations");
};

const givenConcurrentLoans = ({
  ebook,
  audiobook,
  limit = 3
}: {
  ebook: number;
  audiobook: number;
  limit?: number;
}) =>
  givenUserHasBiblioLoanQuotas([
    biblioSplitLoanQuotaFactory.build({
      max_concurrent_user_loans: { ebook: limit, audiobook: limit },
      current_concurrent_loans: { ebook, audiobook }
    })
  ]);

describe("Dashboard - blue recommendations", () => {
  beforeEach(() => stubBackends());

  it("Suggests blue e-books when the e-book quota is used up", () => {
    // Given: three e-book loans, which is all the patron may hold at once.
    givenUserHasBiblioLoans(
      EBOOK_ISBNS.map((isbn) => biblioLoanFactory.build({ material_id: isbn }))
    );
    givenConcurrentLoans({ ebook: 3, audiobook: 0 });

    // When: the patron opens the dashboard.
    const dashboard = new DashboardPage(dashboardStory.withBiblioAdapter);
    dashboard.visit([]);

    // Then: the recommendations are based on the three e-book loans.
    cy.wait("@blueRecommendations")
      .its("request.body.variables")
      .then(({ firstId, secondId, thirdId }) => {
        expect([firstId, secondId, thirdId]).to.have.members(
          EBOOK_ISBNS.map(workIdForIsbn)
        );
      });

    // And: only the blue e-book is shown, once, linking to its e-book edition.
    const slider = dashboard.recommendationSlider(
      "Because you have used up your e-book quota"
    );
    slider.elements
      .title()
      .should("have.text", "E-books you can always borrow");
    slider.elements
      .works()
      .should("have.length", 1)
      .and("have.text", "Blå e-bog");
    slider.firstWorkMaterialType().should("equal", "e-bog");
  });

  it("Suggests blue audiobooks when the audiobook quota is used up", () => {
    // Given: three audiobook loans, which is all the patron may hold at once.
    givenUserHasBiblioLoans(
      AUDIOBOOK_ISBNS.map((isbn) =>
        biblioAudiobookLoanFactory.build({ material_id: isbn })
      )
    );
    givenConcurrentLoans({ ebook: 0, audiobook: 3 });

    // When: the patron opens the dashboard.
    const dashboard = new DashboardPage(dashboardStory.withBiblioAdapter);
    dashboard.visit([]);

    // Then: the recommendations are based on the three audiobook loans.
    cy.wait("@blueRecommendations")
      .its("request.body.variables")
      .then(({ firstId, secondId, thirdId }) => {
        expect([firstId, secondId, thirdId]).to.have.members(
          AUDIOBOOK_ISBNS.map(workIdForIsbn)
        );
      });

    // And: only the blue audiobook is shown, linking to its audiobook edition.
    const slider = dashboard.recommendationSlider(
      "Because you have used up your audiobook quota"
    );
    slider.elements
      .title()
      .should("have.text", "Audiobooks you can always borrow");
    slider.elements
      .works()
      .should("have.length", 1)
      .and("have.text", "Blå lydbog");
    slider.firstWorkMaterialType().should("equal", "lydbog (online)");
  });

  it("Suggests blue titles in each format when both quotas are used up", () => {
    // Given: three loans in each format, which is all the patron may hold.
    givenUserHasBiblioLoans([
      ...EBOOK_ISBNS.map((isbn) =>
        biblioLoanFactory.build({ material_id: isbn })
      ),
      ...AUDIOBOOK_ISBNS.map((isbn) =>
        biblioAudiobookLoanFactory.build({ material_id: isbn })
      )
    ]);
    givenConcurrentLoans({ ebook: 3, audiobook: 3 });

    // When: the patron opens the dashboard.
    const dashboard = new DashboardPage(dashboardStory.withBiblioAdapter);
    dashboard.visit([]);

    // Then: each format's recommendations are based on its own three loans.
    cy.wait(["@blueRecommendations", "@blueRecommendations"]).then(
      (interceptions) => {
        const seedWorkIds = interceptions.map(({ request }) => {
          const { firstId, secondId, thirdId } = request.body.variables;
          return [firstId, secondId, thirdId].sort();
        });
        expect(seedWorkIds).to.have.deep.members([
          EBOOK_ISBNS.map(workIdForIsbn).sort(),
          AUDIOBOOK_ISBNS.map(workIdForIsbn).sort()
        ]);
      }
    );

    // And: each slider shows only the blue title in its own format.
    dashboard.elements.recommendationSliders().should("have.length", 2);

    const ebookSlider = dashboard.recommendationSlider(
      "Because you have used up your e-book quota"
    );
    ebookSlider.elements
      .title()
      .should("have.text", "E-books you can always borrow");
    ebookSlider.elements
      .works()
      .should("have.length", 1)
      .and("have.text", "Blå e-bog");
    ebookSlider.firstWorkMaterialType().should("equal", "e-bog");

    const audiobookSlider = dashboard.recommendationSlider(
      "Because you have used up your audiobook quota"
    );
    audiobookSlider.elements
      .title()
      .should("have.text", "Audiobooks you can always borrow");
    audiobookSlider.elements
      .works()
      .should("have.length", 1)
      .and("have.text", "Blå lydbog");
    audiobookSlider.firstWorkMaterialType().should("equal", "lydbog (online)");
  });

  it("Suggests no blue titles while there is quota left", () => {
    // Given: three loans in each format, but room for more in both.
    givenUserHasBiblioLoans([
      ...EBOOK_ISBNS.map((isbn) =>
        biblioLoanFactory.build({ material_id: isbn })
      ),
      ...AUDIOBOOK_ISBNS.map((isbn) =>
        biblioAudiobookLoanFactory.build({ material_id: isbn })
      )
    ]);
    givenConcurrentLoans({ ebook: 3, audiobook: 3, limit: 4 });

    // When: the patron opens the dashboard.
    const dashboard = new DashboardPage(dashboardStory.withBiblioAdapter);
    dashboard.visit([]);

    // Then: once the loans, the quotas and the regular recommendations are in,
    // no blue titles have been asked for and no slider is shown.
    cy.wait(["@biblioLoans", "@biblioLoanQuotas", "@recommend"]);
    cy.get("@blueRecommendations.all").should("have.length", 0);
    dashboard.elements.recommendationSliders().should("not.exist");
  });
});
