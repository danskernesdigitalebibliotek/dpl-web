import { ComponentObject, Elements } from "@hammzj/cypress-page-object";

/**
 * The modal's root selector, needed on its own to assert absence:
 * `container()` goes through `cy.get`, which waits for the element to exist.
 */
export const loanDetailsModalSelector = ".modal-details";

export class LoanDetailsModalComponent extends ComponentObject {
  public elements!: Elements;

  constructor() {
    super(() => cy.get(loanDetailsModalSelector));
    this.addElements = {
      title: () => this.container().find(".modal-details__title"),
      // Authors and publication year share one line: "Sherman, L. (2022)".
      authors: () => this.container().find("[data-cy='modal-authors']"),
      materialType: () =>
        this.container().find(".modal-details__tags .status-label--outline")
    };
  }
}
