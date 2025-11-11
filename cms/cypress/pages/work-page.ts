import { PageObject, Elements } from '@hammzj/cypress-page-object';

export class WorkPage extends PageObject {
  public elements: Elements;

  constructor() {
    super({ path: '/work/:workId' });

    this.addElements = {
      page_title: () => cy.title(),
    };
  }

  /**
   * Get meta tag by property name.
   */
  metaProperty(name: string) {
    return cy
      .get(`head meta[property="${name}"]`)
      .should('have.attr', 'content');
  }
}
