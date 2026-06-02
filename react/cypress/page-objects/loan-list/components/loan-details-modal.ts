import { ComponentObject, Elements } from "@hammzj/cypress-page-object";

export class LoanDetailsModalComponent extends ComponentObject {
  public elements!: Elements;

  constructor() {
    super(() => cy.get(".modal-details"));
    this.addElements = {
      title: () => this.container().find(".modal-details__title")
    };
  }
}
