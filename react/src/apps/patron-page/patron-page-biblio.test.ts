import { TOKEN_LIBRARY_KEY, TOKEN_USER_KEY } from "../../core/token";
import {
  PatronPagePage,
  patronPageStory
} from "../../../cypress/page-objects/patron-page/PatronPagePage";
import {
  givenUserHasBiblioLoanQuotas,
  givenUserHasBiblioSupportId
} from "../../../cypress/intercepts/biblio/biblio";
import {
  publizonLibraryProfileFactory,
  publizonLoanListFactory
} from "../../../cypress/factories/publizon/publizon.factory";

/**
 * The patron page during the Publizon → Biblio transition.
 *
 * Unlike the loan list, there is no provider probe here: profile data belongs
 * to the user rather than to a single material, so the feature flag alone
 * decides where the support identifier and the loan quotas come from.
 */

const PUBLIZON_CARD_NUMBER = "1234567890";
const BIBLIO_SUPPORT_ID = "BIB-000000-0001";

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
    cy.contains("1 out of 4").should("exist");
    cy.contains("2 out of 3").should("exist");
    // The monthly figures from the same response must not surface here.
    cy.contains("3 out of").should("not.exist");
  });

  // The quota rendering itself (no reservation line, combined quotas, a spent
  // quota reading as full) is pinned by StatusSection's unit tests. This spec
  // covers what only the real page shows: the flag moving the whole section.
});

describe("Patron page - quotas for a patron from another municipality", () => {
  it("Hides the quotas when the flag is off", () => {
    stubBackends({ resident: false });
    const patronPage = new PatronPagePage(patronPageStory.default);

    patronPage.visit([]);
    // The loan list is what feeds the quota counters, so a hidden section
    // never asks for it - the card number is the signal that the page is up.
    cy.wait("@publizonCardNumber");

    // Then: the section stays away - Publizon lends through the site's own
    // retailer account, which grants a non-resident nothing to show.
    cy.contains(PUBLIZON_CARD_NUMBER).should("exist");
    cy.contains("2 out of 7").should("not.exist");
  });

  it("Shows the adapter's quotas when the flag is on", () => {
    stubBackends({ resident: false });
    const patronPage = new PatronPagePage(patronPageStory.withBiblioAdapter);

    patronPage.visit([]);
    cy.wait(["@biblioSupportId", "@biblioLoanQuotas"]);

    // Then: the quotas render anyway - they belong to the patron's own
    // municipality, so residency in the site's says nothing about them.
    cy.contains("1 out of 4").should("exist");
    cy.contains("2 out of 3").should("exist");
  });
});
