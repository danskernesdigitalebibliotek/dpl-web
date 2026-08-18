import { ComponentObject, Elements } from "@hammzj/cypress-page-object";

/**
 * The modal's root selector.
 *
 * Needed on its own because `container()` resolves through `cy.get`, which
 * waits for the element to exist - so it cannot express "the modal is not
 * open". Assert absence with `cy.get(loanDetailsModalSelector)` instead.
 */
export const loanDetailsModalSelector = ".modal-details";

export class LoanDetailsModalComponent extends ComponentObject {
  public elements!: Elements;

  constructor() {
    super(() => cy.get(loanDetailsModalSelector));
    this.addElements = {
      title: () => this.container().find(".modal-details__title")
    };
  }
}
