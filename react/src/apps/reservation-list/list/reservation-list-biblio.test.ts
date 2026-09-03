import {
  ReservationListPage,
  reservationListStory
} from "../../../../cypress/page-objects/reservation-list/ReservationListPage";
import {
  BIBLIO_OFFERED_TITLE,
  BIBLIO_QUEUED_ISBN,
  BIBLIO_QUEUED_TITLE,
  PUBLIZON_TITLE,
  stubReservationListBackends
} from "../../../../cypress/intercepts/reservation-list-page";

/**
 * Feature flag gating for the Biblio adapter on the digital reservations.
 *
 * A library that has not enabled the flag must be completely unaffected - the
 * adapter is not even contacted. That the reservations of a library which HAS
 * enabled it are listed, and described by Biblio rather than Publizon, is
 * asserted by reservation-list-biblio-journey.test.ts, which starts from the
 * same backends.
 */

describe("Reservation list - Biblio adapter feature flag", () => {
  beforeEach(() => stubReservationListBackends());

  it("Leaves the adapter alone when the flag is off", () => {
    const reservationList = new ReservationListPage(
      reservationListStory.default
    );

    // When: the user opens the reservation list without the flag
    reservationList.visit([]);
    cy.wait("@publizonReservations");

    // Then: Publizon stays the only digital provider - the reservations the
    // adapter holds are not listed, even though it would answer for them.
    cy.contains(PUBLIZON_TITLE).should("exist");
    cy.contains(BIBLIO_QUEUED_TITLE).should("not.exist");
    cy.contains(BIBLIO_OFFERED_TITLE).should("not.exist");

    cy.get("@biblioReservations.all").should("have.length", 0);
    cy.get(`@biblioMetadata_${BIBLIO_QUEUED_ISBN}.all`).should(
      "have.length",
      0
    );
  });
});
