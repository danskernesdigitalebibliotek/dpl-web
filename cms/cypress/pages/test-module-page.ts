import { PageObject, Elements } from '@hammzj/cypress-page-object';

export class TestModulePage extends PageObject {
  public elements: Elements;

  constructor() {
    super({ path: '/test-module' });
    this.addElements = {
      info: () => cy.get('#test-module-info'),
      version: () => this.elements.info().find('#version'),
      updb: () => this.elements.info().find('#updb'),
    };
  }

  version() {
    return this.elements.version();
  }

  updb() {
    return this.elements.updb();
  }
}
