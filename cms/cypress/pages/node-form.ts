import { PageObject, Elements } from '@hammzj/cypress-page-object';
import { mediaLibrarySelect } from '../helpers/helper-media';
import { addParagraph } from '../helpers/helper-paragraph';
import { ParagraphComponent, ParagraphType } from './paragraphs';

/**
 * A node form with paragraphs, which is the same for every content type.
 */
export class NodeFormPage extends PageObject {
  public elements: Elements;

  // The number of paragraphs added, which is the position of the next one.
  private paragraphCount = 0;

  constructor(path: string) {
    super({ path });
    this.addElements = {
      titleField: () => cy.findByLabelText('Title'),
      // There is one between each paragraph and one after the last.
      paragraphsModalButton: () =>
        cy.findAllByTitle('Show all Paragraphs').filter(':visible').last(),
      // Its name says whether it will show or hide the sidebar.
      sidebarOpenButton: () =>
        cy.findByRole('button', { name: /(Show|Hide) sidebar panel/ }),
      sidebarCloseButton: () =>
        cy.findByRole('button', { name: 'Close sidebar panel' }),
      saveButton: () =>
        cy
          .get('#edit-gin-sticky-actions')
          .findByRole('button', { name: /Save/i }),
    };
  }

  fillTitle(title: string) {
    this.elements.titleField().type(title);
  }

  /**
   * Adds a paragraph after the ones already added.
   *
   * Yields the paragraph, to fill in its fields.
   */
  addParagraph<T extends ParagraphComponent>(type: ParagraphType<T>): T {
    this.elements.paragraphsModalButton().click();
    addParagraph(type.label);

    return new type(this.paragraphCount++);
  }

  /**
   * Picks an image in the sidebar from the media library.
   *
   * @param fieldName
   *   The machine name of the media field.
   */
  selectSidebarImage(fieldName: string, fileName: string) {
    // The sidebar is collapsed on narrow screens.
    this.openSidebar();
    mediaLibrarySelect(`#${fieldName}-media-library-wrapper`, fileName);
    this.closeSidebar();
  }

  /**
   * Opens the sidebar, unless it is already open.
   */
  openSidebar() {
    this.elements.sidebarOpenButton().then(($trigger) => {
      if ($trigger.attr('aria-expanded') !== 'true') {
        cy.wrap($trigger).click();
      }
    });
  }

  /**
   * Closes the sidebar, unless it is already closed.
   */
  closeSidebar() {
    this.elements.sidebarOpenButton().then(($trigger) => {
      if ($trigger.attr('aria-expanded') === 'true') {
        this.elements.sidebarCloseButton().click();
      }
    });
  }

  save() {
    this.elements.saveButton().click();
  }
}
