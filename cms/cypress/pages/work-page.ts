import { PageObject, Elements } from '@hammzj/cypress-page-object';

export class WorkPage extends PageObject {
  public elements: Elements;

  constructor() {
    super({ path: '/work/:workId' });

    this.addElements = {
      page_title: () => cy.title(),
      materialHeader: () => cy.get('.material-header'),
      seeOnlineButton: () =>
        this.elements
          .materialHeader()
          .findByRole('button', { name: /See online/i }),
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

  gotoOnline() {
    // We explicitly want to test this element as a logged in user,
    // but Cypress manages to scroll the page so the Drupal admin menu
    // overlaps it. So tell Cypress to scroll it to the middle of the
    // screen instead of the top (why this isn't the default, I don't
    // know).
    this.elements.seeOnlineButton().click({ scrollBehavior: 'center' });
  }
}
