import { PageObject, Elements } from '@hammzj/cypress-page-object';

/**
 * The page of an event series, which is where saving the series form ends up.
 */
export class EventSeriesPage extends PageObject {
  public elements: Elements;

  constructor() {
    super({ path: '/events/series/:seriesId' });
    this.addElements = {
      editTab: () => cy.get('a[href^="/events/series/"][href$="/edit"]'),
    };
  }

  /**
   * Yields the entity ID of the series.
   *
   * Front-end event URLs are path aliases, so they carry no entity ID. Admin
   * links to the same entity are built from the internal paths, so read the
   * ID off the edit tab instead.
   */
  seriesId() {
    return this.elements
      .editTab()
      .first()
      .invoke('attr', 'href')
      .then((href) => {
        const match = /\/events\/series\/(\d+)/.exec(String(href));

        if (!match) {
          throw new Error(`Expected to find a series ID in "${href}"`);
        }

        return match[1];
      });
  }
}
