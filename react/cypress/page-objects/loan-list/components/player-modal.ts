import { ComponentObject } from "@hammzj/cypress-page-object";

export class PlayerModalComponent extends ComponentObject {
  constructor() {
    super(() => cy.get("[data-cy='player-modal']"));
  }
}
