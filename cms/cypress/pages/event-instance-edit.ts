import { PageObject, Elements } from '@hammzj/cypress-page-object';
import { typeInCkEditor } from '../helpers/helper-ckeditor';
import { EventLocationComponent } from './event-location';

/**
 * The form for a single occurrence of an event series.
 */
export class EventInstanceEditPage extends PageObject {
  public elements: Elements;

  constructor() {
    super({ path: '/events/:instanceId/edit' });
    this.addElements = {
      // The instance's own title, which overrides the series title.
      titleField: () => cy.findByLabelText('Title'),
      insertFromSeriesButton: () =>
        cy.findByRole('link', { name: 'Insert values from series' }),
      overwriteExistingField: () =>
        cy.findByLabelText('Overwrite any existing values'),
      insertToInstanceButton: () =>
        cy.findByRole('button', { name: 'Insert values to instance' }),
      editAllParagraphsButton: () =>
        cy.findByRole('button', { name: 'Edit all' }),
      saveButton: () =>
        cy
          .get('#edit-gin-sticky-actions')
          .findByRole('button', { name: /Save/i }),
    };
  }

  typeTitle(text: string) {
    this.elements.titleField().type(text);
  }

  /**
   * Copies the values of the series to the instance.
   *
   * When overwrite is not given, the form's default is used.
   */
  insertValuesFromSeries(overwrite?: boolean) {
    this.elements.insertFromSeriesButton().click();
    if (overwrite === true) {
      this.elements.overwriteExistingField().check();
    } else if (overwrite === false) {
      this.elements.overwriteExistingField().uncheck();
    }
    this.elements.insertToInstanceButton().click();
  }

  fillParagraphText(text: string) {
    this.elements.editAllParagraphsButton().click();
    typeInCkEditor(text);
  }

  location() {
    return new EventLocationComponent();
  }

  save() {
    this.elements.saveButton().click();
  }
}
