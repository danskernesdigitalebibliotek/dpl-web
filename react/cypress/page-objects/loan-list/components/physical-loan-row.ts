import { ComponentObject, Elements } from "@hammzj/cypress-page-object";

// A single physical-loan row rendered by StackableMaterial. Scoped via the
// `role="button"` on the row's outer element (physical rows are clickable
// to open due-date/details; digital rows are not).
export class PhysicalLoanRowComponent extends ComponentObject {
  public elements!: Elements;

  constructor(index = 0) {
    super(() => cy.get(".list-reservation[role='button']").eq(index));
    this.addElements = {
      title: () => this.container().find(".list-reservation__header__text"),
      author: () =>
        this.container().find("[data-cy='reservation-about-author']"),
      dueDate: () => this.container().find(".list-reservation__deadline p"),
      statusBadge: () => this.container().find(".status-label"),
      // The arrow button on the right side of the row. For non-stacked rows
      // this opens the loan details modal directly (see material-status.tsx).
      arrowButton: () => this.container().find(".arrow-button")
    };
  }
}
