import { PageObject, Elements } from '@hammzj/cypress-page-object';
import { typeInCkEditor } from '../helpers/helper-ckeditor';

export class EventAddPage extends PageObject {
  public elements: Elements;

  constructor() {
    super({ path: '/events/add/default' });
    this.addElements = {
      titleField: () => cy.findByLabelText('Title'),
      subtitleField: () => cy.findByLabelText('Subtitle'),
      recurTypeField: () => cy.findByLabelText('Recur Type'),
      branchField: () => cy.findByLabelText('Branch'),
      customDate: () => cy.get('#edit-custom-date-wrapper'),
      customFromDateField: () =>
        this.elements
          .customDate()
          .findByText('Start date')
          .siblings()
          .findByLabelText('Date'),
      customFromTimeField: () =>
        this.elements
          .customDate()
          .findByText('Start date')
          .siblings()
          .findByLabelText('Time'),
      customToDateField: () =>
        this.elements
          .customDate()
          .findByText('End date')
          .siblings()
          .findByLabelText('Date'),
      customToTimeField: () =>
        this.elements
          .customDate()
          .findByText('End date')
          .siblings()
          .findByLabelText('Time'),
      saveButton: () =>
        cy
          .get('#edit-gin-sticky-actions')
          .findByRole('button', { name: /Save/i }),
    };
  }

  fillTitle(title: string) {
    this.elements.titleField().type(title);
  }

  fillSubtitle(subtitle: string) {
    this.elements.subtitleField().type(subtitle);
  }

  fillBody(body: string) {
    typeInCkEditor(body);
  }

  selectRecurType(recurType: string) {
    this.elements.recurTypeField().select(recurType, { force: true });
  }

  selectBranch(branch: string) {
    this.elements.branchField().select(branch, { force: true });
  }

  save() {
    this.elements.saveButton().click();
  }
}
