import { TOKEN_LIBRARY_KEY, TOKEN_USER_KEY } from "../../../core/token";
import {
  ReservationListPage,
  reservationListStory
} from "../../../../cypress/page-objects/reservation-list/ReservationListPage";
import { deleteReservationModalSelector } from "../../../../cypress/page-objects/reservation-list/components/delete-reservation-modal";
import {
  biblioOfferedReservationFactory,
  biblioReservationFactory
} from "../../../../cypress/factories/biblio/biblio.factory";
import {
  givenBiblioCancelsReservation,
  givenMaterialIsInBiblio,
  givenMaterialIsNotInBiblio,
  givenUserHasBiblioReservations
} from "../../../../cypress/intercepts/biblio/biblio";
import { publizonProductFactory } from "../../../../cypress/factories/publizon/publizon.factory";

/**
 * A user journey through the digital reservations during the Publizon →
 * Biblio transition, ending in the user cancelling one of them.
 *
 * Cancelling is the part worth walking end to end: both providers carry a
 * material identifier, so a Biblio reservation that leaks into the Publizon
 * branch would be cancelled against the wrong service - a request that
 * succeeds while the reservation stays put. The journey therefore asserts
 * both which service was asked and which was not.
 *
 * ## The Biblio responses come from the adapter contract
 *
 * Every Biblio body is built by `cypress/factories/biblio/biblio.factory.ts`,
 * whose types are generated from `schemas/openapi/biblio-adapter.yaml`. A
 * response that drifts from the contract fails to typecheck rather than
 * quietly producing a test that passes against something the adapter would
 * never send. Publizon is simulated through its own factories, so it is
 * always clear which provider a given response belongs to.
 */

// Publizon
const PUBLIZON_ISBN = "9788771076940";
const PUBLIZON_TITLE = "Tættere end man tror";

// Biblio, from the factory defaults.
const BIBLIO_QUEUED_ISBN = "9788727319346";
const BIBLIO_QUEUED_TITLE = "Din for en sommer";
const BIBLIO_OFFERED_ISBN = "9788740082265";
const BIBLIO_OFFERED_TITLE = "Terræn";

// The reservation Biblio cancels by - deliberately not the ISBN, which is
// what Publizon would have used.
const BIBLIO_QUEUED_RESERVATION_ID = "e5b4bbd1-6d63-4a24-9a25-2f0f4e9b1f11";

// Ready for pickup comes first, then the physical group, then the queued
// digital ones sorted by the date they can be borrowed.
const ROW = {
  biblioOffered: 0, // ready for pickup
  publizonQueued: 1, // can be borrowed 5 Nov
  biblioQueued: 2 // can be borrowed 10 Nov
};

const GROUP = {
  readyForPickup: 0,
  physical: 1,
  digital: 2
};

const stubBackends = () => {
  cy.window().then((win) => {
    const friday20221021 = new Date("2022-10-21T10:00:00.000").getTime();
    // Only Date is faked. Freezing setTimeout would stall TanStack Query's
    // notify scheduler, leaving every component stuck in its loading state.
    cy.clock(friday20221021, ["Date"]);
    win.sessionStorage.setItem(TOKEN_LIBRARY_KEY, "random-token");
    // Reservations are patron-scoped: the adapter answers 403 without a
    // patron, so the service layer refuses to ask. This is a signed-in page.
    win.sessionStorage.setItem(TOKEN_USER_KEY, "random-user-token");
  });

  cy.intercept("GET", "**/external/agencyid/patrons/patronid/v4**", {
    patron: { blockStatus: null }
  });

  // This journey is about the digital reservations, so the user holds no
  // physical ones.
  cy.intercept("GET", "**/external/agencyid/patrons/patronid/reservations/v*", {
    statusCode: 200,
    body: []
  });

  // Given: one older reservation still held in Publizon, still queued
  cy.intercept("GET", "**/v1/user/**", {
    statusCode: 200,
    body: {
      reservations: [
        {
          identifier: PUBLIZON_ISBN,
          createdDateUtc: "2022-10-18T06:32:30Z",
          expectedRedeemDateUtc: "2022-11-05T06:32:30Z",
          expireDateUtc: "2022-11-20T06:32:30Z",
          productTitle: PUBLIZON_TITLE,
          status: 1
        }
      ]
    }
  }).as("publizonReservations");

  // Given: two reservations created through the Biblio adapter - one still
  // queued, one already offered to the user.
  givenUserHasBiblioReservations([
    biblioReservationFactory.build({
      id: BIBLIO_QUEUED_RESERVATION_ID,
      material_id: BIBLIO_QUEUED_ISBN,
      loan_date: "2022-11-10T06:32:30.000Z"
    }),
    biblioOfferedReservationFactory.build({
      material_id: BIBLIO_OFFERED_ISBN
    })
  ]);

  // A reservation carries no title, unlike a loan, so every provider is asked
  // to describe its own material.
  givenMaterialIsNotInBiblio(PUBLIZON_ISBN);
  givenMaterialIsInBiblio({
    isbn: BIBLIO_QUEUED_ISBN,
    title: BIBLIO_QUEUED_TITLE
  });
  givenMaterialIsInBiblio({
    isbn: BIBLIO_OFFERED_ISBN,
    title: BIBLIO_OFFERED_TITLE,
    materialType: "audiobook"
  });

  cy.intercept("GET", `**/v1/products/${PUBLIZON_ISBN}*`, {
    statusCode: 200,
    body: publizonProductFactory.build({
      product: {
        title: PUBLIZON_TITLE,
        productType: 1,
        externalProductId: { idType: 15, id: PUBLIZON_ISBN },
        publisher: "Jentas",
        publicationDate: "2016-05-12T00:00:00Z",
        contributors: [
          { type: "A01", firstName: "Jussi", lastName: "Adler-Olsen" }
        ]
      }
    })
  }).as("publizonProduct");

  givenBiblioCancelsReservation();

  // Publizon's own cancel endpoint. Aliased purely so the journey can prove
  // it was never called for a Biblio reservation.
  cy.intercept("DELETE", "**/v1/user/reservations/**", {
    statusCode: 200,
    body: { code: 101, message: "OK" }
  }).as("publizonCancelReservation");

  cy.interceptGraphql({
    operationName: "GetCoversByPids",
    fixtureFilePath: "cover/cover.json"
  });
  cy.interceptGraphql({
    operationName: "GetBestRepresentationPidByIsbn",
    fixtureFilePath: "cover/cover-get-best-representation-by-isbn.json"
  });
  // The details modal links to the material's work page, which is looked up
  // by ISBN because a digital material carries no pid.
  cy.interceptGraphql({
    operationName: "complexSearchWithPagination",
    fixtureFilePath: "reservation-details/complex-search-with-pagination.json"
  });
};

/**
 * Open a reservation's details the way a user does - by clicking its row.
 *
 * Each row describes itself through its own request, and until that lands it
 * renders as a skeleton that carries the same class but no click handler.
 * Asserting the title first waits for the real row to be there.
 */
const openDetails = (
  reservationList: ReservationListPage,
  row: number,
  title: string
) => {
  reservationList.components.ReservationRow(
    (r) => r.elements.title().should("have.text", title),
    row
  );
  reservationList.reservationRow(row).container().click();
};

describe("Reservation list journey - cancelling a Biblio reservation", () => {
  let reservationList: ReservationListPage;

  beforeEach(() => {
    stubBackends();

    reservationList = new ReservationListPage(
      reservationListStory.withBiblioAdapter
    );

    // When: the user opens their reservations
    reservationList.visit([]);
    cy.wait(["@publizonReservations", "@biblioReservations"]);
  });

  it("Sorts an offered Biblio reservation into the group that is ready to borrow", () => {
    // Then: the offer - Biblio's equivalent of a redeemable Publizon
    // reservation - is what moves it out of the queue.
    reservationList.elements
      .headers()
      .eq(GROUP.readyForPickup)
      .should("contain", "1");

    reservationList.components.ReservationRow(
      (row) => row.elements.title().should("have.text", BIBLIO_OFFERED_TITLE),
      ROW.biblioOffered
    );

    // And: the two still waiting are listed together regardless of provider
    reservationList.elements.headers().eq(GROUP.digital).should("contain", "2");

    reservationList.components.ReservationRow(
      (row) => row.elements.title().should("have.text", PUBLIZON_TITLE),
      ROW.publizonQueued
    );
    reservationList.components.ReservationRow(
      (row) => row.elements.title().should("have.text", BIBLIO_QUEUED_TITLE),
      ROW.biblioQueued
    );
  });

  it("Describes a Biblio reservation from Biblio's own catalogue", () => {
    // A reservation carries no title, so this is the metadata endpoint's
    // answer rendered through the shared material mapping.
    openDetails(reservationList, ROW.biblioQueued, BIBLIO_QUEUED_TITLE);

    reservationList
      .detailsModal()
      .elements.title()
      .should("have.text", BIBLIO_QUEUED_TITLE);
    reservationList
      .detailsModal()
      .elements.authors()
      .should("contain", "Sherman, L.");
    // The audiobook in the same list is labelled by its own material type.
    reservationList
      .detailsModal()
      .elements.statusLabels()
      .first()
      .should("have.text", "E-book");
  });

  it("Cancels a Biblio reservation through the adapter, not through Publizon", () => {
    // When: the user opens a Biblio reservation and asks to remove it
    openDetails(reservationList, ROW.biblioQueued, BIBLIO_QUEUED_TITLE);
    reservationList.detailsModal().elements.removeReservationButton().click();

    // Then: nothing is cancelled until the user confirms
    reservationList.deleteModal().elements.confirmButton().should("be.visible");
    cy.get("@biblioCancelReservation.all").should("have.length", 0);

    // When: the user confirms
    reservationList.deleteModal().elements.confirmButton().click();

    // Then: the adapter is asked to cancel that reservation by its own id -
    // not by the material identifier, which is what Publizon cancels by.
    cy.wait("@biblioCancelReservation")
      .its("request.url")
      .should("contain", `/v1/reservations/${BIBLIO_QUEUED_RESERVATION_ID}`)
      .and("not.contain", BIBLIO_QUEUED_ISBN);

    // And: Publizon is left out of it entirely
    cy.get("@publizonCancelReservation.all").should("have.length", 0);

    // And: the user is told it went through
    reservationList
      .deleteModal()
      .elements.acknowledgeButton()
      .should("be.visible");
  });

  it("Closes the confirmation once the user acknowledges it", () => {
    openDetails(reservationList, ROW.biblioQueued, BIBLIO_QUEUED_TITLE);
    reservationList.detailsModal().elements.removeReservationButton().click();
    reservationList.deleteModal().elements.confirmButton().click();
    cy.wait("@biblioCancelReservation");

    reservationList.deleteModal().elements.acknowledgeButton().click();

    // Asserted through the raw selector because the page object's container()
    // waits for the element to exist.
    cy.get(deleteReservationModalSelector).should("not.exist");
  });

  it("Still cancels a Publizon reservation through Publizon", () => {
    // The transition must not break the reservations a user already had.
    openDetails(reservationList, ROW.publizonQueued, PUBLIZON_TITLE);
    reservationList.detailsModal().elements.removeReservationButton().click();
    reservationList.deleteModal().elements.confirmButton().click();

    cy.wait("@publizonCancelReservation")
      .its("request.url")
      .should("contain", PUBLIZON_ISBN);

    cy.get("@biblioCancelReservation.all").should("have.length", 0);
  });
});
