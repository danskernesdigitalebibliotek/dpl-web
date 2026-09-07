import { ComponentObject, Elements } from "@hammzj/cypress-page-object";

/** The modal's root selector, needed on its own to assert absence. */
export const deleteReservationModalSelector = ".modal-cta";

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
