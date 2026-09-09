import { TOKEN_LIBRARY_KEY, TOKEN_USER_KEY } from "../../core/token";
import {
  DashboardPage,
  dashboardStory
} from "../../../cypress/page-objects/dashboard/DashboardPage";
import {
  biblioAudiobookLoanFactory,
  biblioLoanFactory
} from "../../../cypress/factories/biblio/biblio.factory";
import { givenUserHasBiblioLoans } from "../../../cypress/intercepts/biblio/biblio";
import { publizonLoanListFactory } from "../../../cypress/factories/publizon/publizon.factory";

/**
 * Whether Biblio loans reach the dashboard counts at all: the flag travels
 * through this app's own entry and HOC chain, separate from the loan list's.
 *
 * How the combined list renders is covered by loan-list-biblio-journey.
 */

const stubBackends = () => {
  cy.window().then((win) => {
    const friday20221021 = new Date("2022-10-21T10:00:00.000").getTime();
    // Only Date: freezing timers stalls TanStack Query's notify scheduler.
    cy.clock(friday20221021, ["Date"]);
    win.sessionStorage.setItem(TOKEN_LIBRARY_KEY, "random-token");
    // Loans are patron-scoped: the adapter answers 403 without a patron, so
    // the service layer refuses to ask. A loan list is a signed-in page.
    win.sessionStorage.setItem(TOKEN_USER_KEY, "random-user-token");
  });

  cy.intercept("GET", "**/external/agencyid/patrons/patronid/v4**", {
    patron: { blockStatus: null }
  });

  // Nothing physical and nothing in Publizon, so every number is Biblio's.
  cy.intercept("GET", "**/external/agencyid/patrons/patronid/loans/v2**", {
    statusCode: 200,
    body: []
  });

  cy.intercept("GET", "**/v1/user/**", {
    statusCode: 200,
    body: publizonLoanListFactory.build({ loans: [] })
  }).as("publizonLoans");

  // Given: two loans created through the service layer - the e-book runs
  // until 16 Nov, the audiobook until 24 Oct, seen from 21 Oct.
  givenUserHasBiblioLoans([
    biblioLoanFactory.build(),
    biblioAudiobookLoanFactory.build()
  ]);
};

describe("Dashboard - Biblio adapter feature flag", () => {
  beforeEach(() => stubBackends());

  it("Counts the Biblio loans, each in the bucket its end date puts it in", () => {
    const dashboard = new DashboardPage(dashboardStory.withBiblioAdapter);

    // When: the user opens the dashboard
    dashboard.visit([]);
    cy.wait("@biblioLoans");

    // Then: the audiobook due in three days counts as due soon, the e-book
    // due in November as having time left. Asserting both matters - one alone
    // would pass with every loan in the same bucket. The data-cy still says
    // "physical", but the count covers every provider.
    dashboard.elements.loansSoonOverdue().should("contain", "1");
    dashboard.elements.loansNotOverdue().should("contain", "1");
  });

  it("Leaves the adapter alone when the flag is off", () => {
    const dashboard = new DashboardPage(dashboardStory.default);

    // When: the user opens the dashboard without the flag
    dashboard.visit([]);
    cy.wait("@publizonLoans");

    // Then: Publizon stays the only digital provider, and with no loans
    // anywhere the dashboard has nothing to report.
    cy.get("@biblioLoans.all").should("have.length", 0);
    dashboard.elements.loansSoonOverdue().should("not.exist");
    dashboard.elements.loansNotOverdue().should("not.exist");
  });
});
