import { PageObject, Elements } from '@hammzj/cypress-page-object';

/**
 * The page of a node, which is where saving a node form ends up.
 */
export class NodePage extends PageObject {
  public elements: Elements;

  constructor() {
    super({ path: '/node/:nodeId' });
    this.addElements = {
      hero: () => cy.get('.hero'),
      shortlink: () => cy.get('link[rel="shortlink"]'),
    };
  }

  /**
   * Yields the entity ID of the node.
   *
   * Node URLs are usually path aliases, so read the ID off the shortlink.
   */
  nodeId() {
    return this.elements
      .shortlink()
      .invoke('attr', 'href')
      .then((href) => String(href).split('/').pop() as string);
  }
}
