import {
  ReservationListPage,
  reservationListStory
} from "../../../../cypress/page-objects/reservation-list/ReservationListPage";
import { deleteReservationModalSelector } from "../../../../cypress/page-objects/reservation-list/components/delete-reservation-modal";
import {
  BIBLIO_OFFERED_TITLE,
  BIBLIO_QUEUED_ISBN,
  BIBLIO_QUEUED_RESERVATION_ID,
  BIBLIO_QUEUED_TITLE,
  PUBLIZON_ISBN,
  PUBLIZON_TITLE,
  stubReservationListBackends
} from "../../../../cypress/intercepts/reservation-list-page";

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
 * The reservations themselves, and the contract the Biblio responses are
 * built from, come from the shared reservation-list intercepts.
 */

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
    stubReservationListBackends();

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
