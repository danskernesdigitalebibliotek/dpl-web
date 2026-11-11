import { PageObject, Elements } from '@hammzj/cypress-page-object';
import { EventInstanceEditPage } from './event-instance-edit';

/**
 * The "Edit Instances" tab of an event series.
 */
export class EventInstancesPage extends PageObject {
  public elements: Elements;

  constructor() {
    super({ path: '/events/series/:seriesId/edit-instances' });
    this.addElements = {
      // The ID column has no name of its own.
      idCells: () => cy.get('td.views-field-id'),
      editLinks: (title: string) =>
        cy.findAllByRole('link', { name: `Edit ${title}` }),
    };
  }

  /**
   * Yields the entity IDs of the instances.
   */
  instanceIds() {
    return this.elements
      .idCells()
      .then((cells) =>
        cells.toArray().map((cell: HTMLElement) => cell.innerText.trim()),
      );
  }

  editFirst(title: string) {
    this.elements.editLinks(title).first().click();

    return new EventInstanceEditPage();
  }
}
