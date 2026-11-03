import { NodeFormPage } from './node-form';

export class PageAddPage extends NodeFormPage {
  constructor() {
    super('/node/add/page');
    this.addElements = {
      displayTitlesField: () => cy.findByLabelText('Display titles'),
      subtitleField: () => cy.findByLabelText('Subtitle'),
    };
  }

  /**
   * Starts a page with the fields every page needs.
   */
  static add(title: string) {
    const pageAdd = new PageAddPage();
    pageAdd.visit([]);
    pageAdd.fillTitle(title);
    return pageAdd;
  }

  fillSubtitle(subtitle: string) {
    // The subtitle is hidden until the titles are displayed.
    this.elements.displayTitlesField().check();
    this.elements.subtitleField().type(subtitle);
  }
}
