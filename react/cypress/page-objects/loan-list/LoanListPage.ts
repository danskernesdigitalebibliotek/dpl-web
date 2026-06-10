import {
  PageObject,
  Elements,
  NestedComponents
} from "@hammzj/cypress-page-object";
import { DigitalLoanRowComponent } from "./components/digital-loan-row";
import { PhysicalLoanRowComponent } from "./components/physical-loan-row";
import { PlayerModalComponent } from "./components/player-modal";
import { LoanDetailsModalComponent } from "./components/loan-details-modal";

export class LoanListPage extends PageObject {
  public elements!: Elements;

  public components!: NestedComponents;

  constructor() {
    super({
      path: "/iframe.html?path=/story/apps-loan-list--primary"
    });

    this.elements = {
      digitalLoansHeader: () => cy.get(".loan-list-page h2").eq(1),
      physicalLoansHeader: () => cy.get(".loan-list-page h2").eq(0),
      digitalLoanContainer: () => cy.get(".list-reservation-container").last(),
      physicalLoanContainer: () =>
        cy.get(".list-reservation-container").first(),
      emptyListMessages: () => cy.get(".dpl-list-empty")
    };

    // DigitalLoanRow lives inside the page; PlayerModal and LoanDetailsModal
    // are portaled to document.body, so they must NOT be scoped within the
    // page container — that's why they expose their own component instances
    // directly via `playerModal()` / `detailsModal()` below.
    this.addNestedComponents = {
      DigitalLoanRow: (fn, index = 0) =>
        this.performWithin(
          this.container(),
          new DigitalLoanRowComponent(index as number),
          fn
        ),
      PhysicalLoanRow: (fn, index = 0) =>
        this.performWithin(
          this.container(),
          new PhysicalLoanRowComponent(index as number),
          fn
        )
    };
  }

  playerModal() {
    return new PlayerModalComponent();
  }

  detailsModal() {
    return new LoanDetailsModalComponent();
  }
}
