import { ComponentObject, Elements } from "@hammzj/cypress-page-object";

/** The modal's root selector, needed on its own to assert absence. */
export const onlineLoanModalSelector = "[data-cy='online-internal-modal']";

/** The modal that confirms a loan of a digital material. */
export class OnlineLoanModalComponent extends ComponentObject {
  public elements!: Elements;

  constructor() {
    super(() => cy.get(onlineLoanModalSelector));
    this.addElements = {
      // "You have borrowed X of Y this month", rendered by
      // MaterialAvailabilityTextParagraph.
      quotaText: () =>
        this.container().find(".reservation-modal-submit p.text-small-caption"),
      approveButton: () =>
        this.container().find(
          "[data-cy='material-button-online-internal-reader']"
        ),
      // Rendered in place of the form once the loan went through.
      responseStatus: () =>
        this.container().find("[data-cy='open-oprder-response-status-text']")
    };
  }
}
