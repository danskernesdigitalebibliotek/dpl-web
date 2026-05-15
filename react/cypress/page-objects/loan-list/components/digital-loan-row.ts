import { ComponentObject, Elements } from "@hammzj/cypress-page-object";

// A single digital loan row rendered by DigitalLoanCard. Scoped to the
// `.list-reservation--no-hover` variant so it can't accidentally match a
// physical-loan row (which uses the same outer class but is clickable).
export class DigitalLoanRowComponent extends ComponentObject {
  public elements!: Elements;

  constructor(index = 0) {
    super(() =>
      cy.get(".list-reservation.list-reservation--no-hover").eq(index)
    );
    this.addElements = {
      readerButton: () =>
        this.container().find("[data-cy='loan-list-reader-button']"),
      playerButton: () =>
        this.container().find("[data-cy='loan-list-player-button']"),
      loanDetailsButton: () =>
        this.container().find("[data-cy='loan-list-loan-details-button']"),
      title: () => this.container().find(".list-reservation__header__text"),
      materialType: () => this.container().find(".status-label"),
      author: () => this.container().find(".list-reservation__about p").first(),
      dueDate: () => this.container().find(".list-reservation__deadline p")
    };
  }
}
