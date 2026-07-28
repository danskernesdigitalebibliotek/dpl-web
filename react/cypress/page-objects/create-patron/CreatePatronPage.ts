import {
  Elements,
  NestedComponents,
  PageObject
} from "@hammzj/cypress-page-object";
import { DialogFindLibrary } from "./components/DialogFindLibrary";

export class CreatePatronPage extends PageObject {
  public elements!: Elements;
  public components!: NestedComponents;

  constructor(storyId = "apps-create-patron--primary") {
    super({
      path: `/iframe.html?args=&globals=&id=${storyId}&viewMode=story`
    });

    this.addElements = {
      title: () => cy.get(".create-patron-page__title"),
      contactInfo: () => cy.get("[data-cy='patron-page-contact-info']"),
      phoneNumberLabel: () => cy.get("label[for='phone-input']"),
      receiveSmsCheckbox: () => cy.get("label[for='phone-messages']"),
      pincode: () => cy.get("[data-cy='pincode-section']"),
      librarySelectButton: () => cy.get("[data-cy='library-select-section']"),
      submitButton: () =>
        cy.get("[data-cy='complete-user-registration-button']"),
      cancelButton: () => cy.get("[data-cy='cancel-user-registration-button']")
    };

    this.addNestedComponents = {
      DialogFindLibrary: (fn) =>
        this.performWithin(this.container(), new DialogFindLibrary(), fn)
    };
  }

  openFindLibraryDialog() {
    this.elements.librarySelectButton().click();
  }

  toggleReceiveSms() {
    this.elements.receiveSmsCheckbox().click();
  }

  verifyFindLibraryDialogIsVisible() {
    cy.get(".find-library-dialog").shouldContainAll(["Find nearest library"]);
  }

  verifyDialogIsNotVisible() {
    cy.get(".find-library-dialog").should("not.be.visible");
  }
}
