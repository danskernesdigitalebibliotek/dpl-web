import {
  ReservationListPage,
  reservationListStory
} from "../../../../cypress/page-objects/reservation-list/ReservationListPage";
import { deleteReservationModalSelector } from "../../../../cypress/page-objects/reservation-list/components/delete-reservation-modal";
import {
  PUBLIZON_TITLE,
  stubReservationListBackends
} from "../../../../cypress/intercepts/reservation-list-page";

/**
 * TEMPORARY: the reservations a patron already holds while the Publizon queue
 * stands still for migration.
 *
 * The queue Biblio copies has to match the one it copied, so a cancellation
 * during the freeze is as lossy as a new reservation. The reservation stays
 * listed either way - it is still theirs - so what the freeze changes is only
 * whether it can be given up, and whether that is explained.
 *
 * The backends are the shared reservation-list ones. With the adapter flag off
 * the digital group holds the single Publizon reservation, which is the one
 * being migrated.
 */

const CANCEL_CLOSED_TEXT =
  "You cannot cancel this reservation while we are moving to a new service.";

const openPublizonReservation = (reservationList: ReservationListPage) => {
  // Each row describes itself through its own request and renders as a
  // skeleton until that lands, so the title is what says the row is real.
  reservationList.components.ReservationRow(
    (row) => row.elements.title().should("have.text", PUBLIZON_TITLE),
    0
  );
  reservationList.reservationRow(0).container().click();
};

describe("Reservation list - the Publizon reservation queue frozen", () => {
  beforeEach(() => stubReservationListBackends());

  it("Keeps the reservation, and refuses to cancel it with a reason", () => {
    const reservationList = new ReservationListPage(
      reservationListStory.withClosedPublizonReservations
    );

    reservationList.visit([]);
    cy.wait("@publizonReservations");

    openPublizonReservation(reservationList);

    // Then: the details open on the reservation the patron still holds
    reservationList
      .detailsModal()
      .elements.title()
      .should("have.text", PUBLIZON_TITLE);

    // And: giving it up is refused, with the reason stated once. Asserted
    // through the modal rather than with cy.contains, which resolves against
    // the document this story is not the only one in.
    reservationList
      .detailsModal()
      .elements.removeReservationButton()
      .should("be.disabled");
    reservationList
      .detailsModal()
      .container()
      .should("contain", CANCEL_CLOSED_TEXT);

    // And: the confirmation never opens, so nothing is cancelled
    cy.get(deleteReservationModalSelector).should("not.exist");
    cy.get("@publizonCancelReservation.all").should("have.length", 0);
  });

  it("Cancels as usual outside the freeze", () => {
    const reservationList = new ReservationListPage(
      reservationListStory.default
    );

    reservationList.visit([]);
    cy.wait("@publizonReservations");

    openPublizonReservation(reservationList);

    reservationList
      .detailsModal()
      .elements.removeReservationButton()
      .should("be.enabled");
    reservationList
      .detailsModal()
      .container()
      .should("not.contain", CANCEL_CLOSED_TEXT);
  });
});
