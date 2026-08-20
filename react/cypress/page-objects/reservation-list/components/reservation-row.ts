import { ComponentObject, Elements } from "@hammzj/cypress-page-object";

// A single reservation row rendered by ReservationMaterial. The rows share
// the `.list-reservation` class with the loan list, but live inside a
// reservation list container.
export class ReservationRowComponent extends ComponentObject {
  public elements!: Elements;

  constructor(index = 0) {
    super(() => cy.get(".list-reservation").eq(index));
    this.addElements = {
      title: () => this.container().find(".list-reservation__title__text"),
      materialType: () => this.container().find(".status-label"),
      author: () => this.container().find(".list-reservation__about p").first()
    };
  }
}
