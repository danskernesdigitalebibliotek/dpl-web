import { PageObject, Elements } from '@hammzj/cypress-page-object';

export class WorkPage extends PageObject {
  public elements: Elements;

  constructor() {
    super({ path: '/work/:workId' });

    this.addElements = {
      page_title: () => cy.title(),
    };
  }
}
