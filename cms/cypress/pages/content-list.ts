import { PageObject, Elements } from '@hammzj/cypress-page-object';

/**
 * The admin list of content.
 */
export class ContentListPage extends PageObject {
  public elements: Elements;

  constructor() {
    super({ path: '/admin/content' });
    this.addElements = {
      titleLink: (title: string) => cy.findByRole('link', { name: title }),
    };
  }

  /**
   * Visits the list, showing only the content whose title contains search.
   */
  visitSearch(search: string) {
    this.visit([], { qs: { title: search, status: 'All', langcode: 'All' } });
  }

  /**
   * Yields the path of the content with the title.
   *
   * The list is an admin page, so it links to the path on the CMS, also for
   * GO content.
   */
  pathOf(title: string) {
    this.visitSearch(title);
    return this.elements
      .titleLink(title)
      .invoke('attr', 'href')
      .then((path) => String(path));
  }
}
