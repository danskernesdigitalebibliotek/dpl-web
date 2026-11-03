import { PageObject, Elements } from '@hammzj/cypress-page-object';
import { EventEditPage } from './event-edit';

/**
 * The admin list of event series.
 */
export class EventSeriesListPage extends PageObject {
  public elements: Elements;

  constructor() {
    super({ path: '/admin/content/eventseries' });
    this.addElements = {
      editLink: (title: string) =>
        cy.findByRole('link', { name: `Edit ${title}` }),
      deleteButton: () => cy.findByRole('button', { name: 'Delete' }),
    };
  }

  /**
   * Visits the list, showing only the series whose title contains search.
   */
  visitSearch(search: string) {
    this.visit([], { qs: { search } });
  }

  edit(title: string) {
    this.elements.editLink(title).click();

    return new EventEditPage();
  }

  /**
   * Deletes every series whose title starts with prefix, if there are any.
   */
  deleteAllTitled(prefix: string) {
    this.visitSearch(prefix);
    // Looked up without retrying, as there may be none.
    cy.get('body').then(($body) => {
      const deletePaths = $body
        .find(`a[aria-label^="Delete ${prefix}"]`)
        .toArray()
        .map((link) => link.getAttribute('href') as string);

      deletePaths.forEach((path) => {
        // Technically another page, but we'll handle it.
        cy.visit(path);
        this.elements.deleteButton().click();
      });
    });
  }
}
