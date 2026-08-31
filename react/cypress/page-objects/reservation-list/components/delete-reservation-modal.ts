import { ComponentObject, Elements } from "@hammzj/cypress-page-object";

/**
 * The modal's root selector. See the note in reservation-details-modal.ts for
 * why the raw selector is exported alongside the component.
 */
export const deleteReservationModalSelector = ".modal-cta";

/** The confirmation shown before a reservation is actually cancelled. */
export class DeleteReservationModalComponent extends ComponentObject {
  public elements!: Elements;

  constructor() {
    super(() => cy.get(deleteReservationModalSelector));
    this.addElements = {
      confirmButton: () =>
        this.container().find("[data-cy='delete-reservation-button']"),
      // Shown once the cancellation has gone through.
      acknowledgeButton: () =>
        this.container().find("[data-cy='modal-cta-button']")
    };
  }
}
