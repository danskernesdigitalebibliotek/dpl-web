import { TOKEN_LIBRARY_KEY, TOKEN_USER_KEY } from "../../core/token";
import {
  PatronPagePage,
  patronPageStory
} from "../../../cypress/page-objects/patron-page/PatronPagePage";
import {
  givenOrganizationHasBiblioReservationLimits,
  givenUserHasBiblioLoanQuotas,
  givenUserHasBiblioSupportId
} from "../../../cypress/intercepts/biblio/biblio";
import {
  publizonLibraryProfileFactory,
  publizonLoanListFactory
} from "../../../cypress/factories/publizon/publizon.factory";
import {
  BIBLIO_ORG_ID,
  biblioSplitLoanQuotaFactory
} from "../../../cypress/factories/biblio/biblio.factory";

/**
 * The patron page during the Publizon → Biblio transition.
 *
 * Unlike the loan list, there is no provider probe here: profile data belongs
 * to the user rather than to a single material, so the feature flag alone
 * decides where the support identifier and the loan quotas come from.
 *
 * The quota rendering itself (no reservation line, combined quotas, a spent
 * quota reading as full) is pinned by StatusSection's unit tests. This spec
 * covers what only the real page shows: the flag moving the whole section,
 * and residency no longer hiding it.
 */

const PUBLIZON_CARD_NUMBER = "1234567890";
const BIBLIO_SUPPORT_ID = "BIB-000000-0001";

// The counters the adapter's quotas render as, read off the fixture so a
// changed default cannot leave a stale literal behind.
const biblioQuota = biblioSplitLoanQuotaFactory.build();
const BIBLIO_EBOOKS_OUT_OF = `${biblioQuota.current_concurrent_loans.ebook} out of ${biblioQuota.max_concurrent_user_loans.ebook}`;
const BIBLIO_AUDIOBOOKS_OUT_OF = `${biblioQuota.current_concurrent_loans.audiobook} out of ${biblioQuota.max_concurrent_user_loans.audiobook}`;

const stubBackends = ({ resident = true } = {}) => {
  cy.window().then((win) => {
    // The profile page only loads patron data for a signed-in user -
    // isAnonymous() checks the user token specifically - and the Biblio
    // client prefers that token too.
    win.sessionStorage.setItem(TOKEN_USER_KEY, "random-user-token");
    win.sessionStorage.setItem(TOKEN_LIBRARY_KEY, "random-token");
  });

  cy.intercept("GET", "**/external/agencyid/patrons/patronid/v4**", {
    patron: {
      blockStatus: null,
      name: "Test Låner",
      address: {
        coName: "",
        street: "Eksempelvej 1",
        postalCode: "8000",
        city: "Aarhus",
        country: "DK"
      },
      emailAddress: "test@example.com",
      phoneNumber: "12345678",
      receiveEmail: true,
      receivePostalMail: false,
      onHold: {},
      resident
    }
  }).as("patron");

  // Publizon's own numbers, so a flag-on run can be told apart from a
  // flag-off run by the values on screen.
  cy.intercept("GET", "**/v1/library/profile*", {
    statusCode: 200,
    body: publizonLibraryProfileFactory.build({
      maxConcurrentEbookLoansPerBorrower: 7,
      maxConcurrentAudioLoansPerBorrower: 8
    })
  }).as("publizonLibraryProfile");

  cy.intercept("GET", "**/v1/user/**", {
    statusCode: 200,
    body: publizonLoanListFactory.build({
      userData: {
        totalLoans: 2,
        totalEbookLoans: 2,
        totalAudioLoans: 6,
        friendlyCardNumber: PUBLIZON_CARD_NUMBER
      }
    })
  }).as("publizonUser");

  // The card number has its own endpoint. Registered after the catch-all so
  // it wins - Cypress matches the most recently registered route first.
  cy.intercept("GET", "**/v1/user/cardnumber/friendly*", {
    statusCode: 200,
    body: { friendlyCardNumber: PUBLIZON_CARD_NUMBER, code: 101, message: "OK" }
  }).as("publizonCardNumber");

  givenUserHasBiblioSupportId();
  givenUserHasBiblioLoanQuotas();
  givenOrganizationHasBiblioReservationLimits();
};

describe("Patron page - Biblio adapter feature flag", () => {
  beforeEach(() => stubBackends());

  it("Shows Publizon's card number and quotas when the flag is off", () => {
    const patronPage = new PatronPagePage(patronPageStory.default);

    // When: the user opens their profile
    patronPage.visit([]);
    cy.wait("@publizonUser");

    // Then: the identifier and the numbers are Publizon's
    cy.contains(PUBLIZON_CARD_NUMBER).should("exist");
    cy.contains("2 out of 7").should("exist");
    cy.contains("6 out of 8").should("exist");

    // And: the adapter is never contacted
    cy.get("@biblioSupportId.all").should("have.length", 0);
    cy.get("@biblioLoanQuotas.all").should("have.length", 0);
    cy.get("@biblioOrganizationConfigs.all").should("have.length", 0);
  });

  it("Shows Biblio's support id and quotas when the flag is on", () => {
    const patronPage = new PatronPagePage(patronPageStory.withBiblioAdapter);

    // When: the user opens their profile
    patronPage.visit([]);
    cy.wait(["@biblioSupportId", "@biblioLoanQuotas"]);

    // Then: the support identifier comes from the adapter
    cy.contains(BIBLIO_SUPPORT_ID).should("exist");
    cy.contains(PUBLIZON_CARD_NUMBER).should("not.exist");

    // And: the quotas are the adapter's concurrent counters - the loans the
    // user holds right now, not the monthly totals.
    cy.contains(BIBLIO_EBOOKS_OUT_OF).should("exist");
    cy.contains(BIBLIO_AUDIOBOOKS_OUT_OF).should("exist");
    // The monthly figures from the same response must not surface here.
    cy.contains("3 out of").should("not.exist");

    // And: the reservation ceilings come from the organization the quotas
    // were issued for.
    cy.wait("@biblioOrganizationConfigs")
      .its("request.query.organization_id")
      .should("eq", BIBLIO_ORG_ID);
    cy.contains("You can reserve 5 ebooks and 6 audiobooks").should("exist");
  });
});

describe("Patron page - quotas for a patron from another municipality", () => {
  beforeEach(() => stubBackends({ resident: false }));

  it("Hides the quotas when the flag is off", () => {
    const patronPage = new PatronPagePage(patronPageStory.default);

    // When: the user opens their profile
    patronPage.visit([]);
    cy.contains(PUBLIZON_CARD_NUMBER).should("exist");

    // Then: the whole section stays away
    cy.get("section.dpl-status-loans").should("not.exist");
  });

  it("Shows the adapter's quotas when the flag is on", () => {
    const patronPage = new PatronPagePage(patronPageStory.withBiblioAdapter);

    // When: the user opens their profile
    patronPage.visit([]);
    cy.wait(["@biblioSupportId", "@biblioLoanQuotas"]);

    // Then: the quotas render for a non-resident too
    cy.contains(BIBLIO_EBOOKS_OUT_OF).should("exist");
    cy.contains(BIBLIO_AUDIOBOOKS_OUT_OF).should("exist");
  });
});
