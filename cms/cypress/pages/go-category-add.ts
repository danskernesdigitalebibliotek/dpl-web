import { GoNodeAddPage } from './go-node-add';

export class GoCategoryAddPage extends GoNodeAddPage {
  constructor() {
    super('go_category');
    this.addElements = {
      menuTitleField: () => cy.findByLabelText('Category menu title'),
    };
  }

  /**
   * Starts a category with the fields every category needs.
   */
  static add(title: string) {
    const categoryAdd = new GoCategoryAddPage();
    categoryAdd.visitReturningToContent();
    categoryAdd.fillTitle(title);
    categoryAdd.fillMenuTitle(title);
    categoryAdd.selectMenuImage('paige-cody');
    return categoryAdd;
  }

  fillMenuTitle(title: string) {
    // The menu title is in the sidebar, which is collapsed on narrow screens.
    this.openSidebar();
    this.elements.menuTitleField().type(title);
  }

  selectMenuImage(fileName: string) {
    this.selectSidebarImage('field_category_menu_image', fileName);
  }
}
