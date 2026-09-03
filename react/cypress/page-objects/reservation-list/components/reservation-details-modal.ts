import { ComponentObject, Elements } from "@hammzj/cypress-page-object";

/**
 * The modal's root selector.
 *
 * Needed on its own because `container()` resolves through `cy.get`, which
 * waits for the element to exist - so it cannot express "the modal is not
 * open". Assert absence with `cy.get(reservationDetailsModalSelector)`.
 */
export const reservationDetailsModalSelector = ".modal-details";

/**
 * The details of a single reservation, opened by clicking its row.
 *
 * A digital reservation is removed from here, which is the only way a user
 * reaches the cancel confirmation.
 */
export class ReservationDetailsModalComponent extends ComponentObject {
  public elements!: Elements;

  constructor() {
    super(() => cy.get(reservationDetailsModalSelector));
    this.addElements = {
      title: () => this.container().find("h2").first(),
      authors: () => this.container().find("[data-cy='modal-authors']"),
      statusLabels: () => this.container().find(".status-label"),
      // Rendered twice - once for desktop, once for mobile - so interactions
      // have to pick one.
      removeReservationButton: () =>
        this.container()
          .find("[data-cy='remove-digital-reservation-button']")
          .first()
    };
  }
}
