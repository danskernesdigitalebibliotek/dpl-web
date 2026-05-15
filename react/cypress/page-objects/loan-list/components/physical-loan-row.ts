import { ComponentObject, Elements } from "@hammzj/cypress-page-object";

// A single physical-loan row rendered by StackableMaterial. Physical rows
// use the `cursor-pointer` variant of `.list-reservation` (clickable to
// open due-date / details), distinguishing them from digital rows which
// use `--no-hover`.
export class PhysicalLoanRowComponent extends ComponentObject {
  public elements!: Elements;

  constructor(index = 0) {
    super(() =>
      cy
        .get(".list-reservation.cursor-pointer")
        .not(".list-reservation--no-hover")
        .eq(index)
    );
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
