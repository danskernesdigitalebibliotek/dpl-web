import { PageObject, Elements } from '@hammzj/cypress-page-object';
import { typeInCkEditor } from '../helpers/helper-ckeditor';

export class NodeAddArticlePage extends PageObject {
  public elements: Elements;

  constructor() {
    super({ path: '/node/add/article' });
    this.addElements = {
      titleField: () => cy.findByRole('textbox', { name: /^Title/i }),
      classesField: () =>
        cy.findByRole('textbox', { name: /Custom CSS classes/i }),
      paragraphs: () => cy.get('#edit-field-paragraphs-wrapper'),
      addParagraphButton: () =>
        this.elements.paragraphs().findByRole('button', { name: /Add/i }),
      saveButton: () =>
        cy
          .get('#edit-gin-sticky-actions')
          .findByRole('button', { name: /Save/i }),
    };
  }

  fillTitle(title: string) {
    this.elements.titleField().type(title);
  }

  fillClasses(classes: string) {
    this.elements.classesField().type(classes);
  }

  addParagraph(type: string) {
    this.elements.addParagraphButton().click();
    cy.findByRole('button', { name: new RegExp(type, 'i') }).click();
  }

  save() {
    this.elements.saveButton().click();
  }

  /*
   * The following functions ought to be moved to Components.
   */

  fillParagraphText(text: string) {
    typeInCkEditor(text);
  }

  fillParagraphClasses(classes: string) {
    this.elements
      .paragraphs()
      .findByRole('textbox', { name: /Custom CSS classes/i })
      .type(classes);
  }
}
