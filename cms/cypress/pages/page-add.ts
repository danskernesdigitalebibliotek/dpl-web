import { NodeFormPage } from './node-form';

export class PageAddPage extends NodeFormPage {
  constructor() {
    super('/node/add/page');
    this.addElements = {
      displayTitlesField: () => cy.findByLabelText('Display titles'),
      subtitleField: () => cy.findByLabelText('Subtitle'),
    };
  }

  fillSubtitle(subtitle: string) {
    // The subtitle is hidden until the titles are displayed.
    this.elements.displayTitlesField().check();
    this.elements.subtitleField().type(subtitle);
  }
}
