import { PageObject, Elements } from '@hammzj/cypress-page-object';
import { pickBranchAddress } from '../helpers/helper-branch';

export class BranchAddPage extends PageObject {
  public elements: Elements;

  constructor() {
    super({ path: '/node/add/branch' });
    this.addElements = {
      titleField: () => cy.findByLabelText('Title'),
      // Its name says whether it will show or hide the sidebar.
      sidebarOpenButton: () =>
        cy.findByRole('button', { name: /(Show|Hide) sidebar panel/ }),
      sidebarCloseButton: () =>
        cy.findByRole('button', { name: 'Close sidebar panel' }),
      emailField: () => cy.findByLabelText('Email'),
      phoneField: () => cy.findByLabelText('Phone'),
      agencyBranchField: () => cy.findByLabelText('Agency Branch ID'),
      saveButton: () =>
        cy
          .get('#edit-gin-sticky-actions')
          .findByRole('button', { name: /Save/i }),
    };
  }

  fillTitle(title: string) {
    this.elements.titleField().type(title);
  }

  fillContactInfo(email: string, phone: string) {
    // The contact info is in the sidebar, which is collapsed on narrow screens.
    this.elements.sidebarOpenButton().click();
    this.elements.emailField().type(email);
    this.elements.phoneField().type(phone);
    this.elements.sidebarCloseButton().click();
  }

  pickAddress(search: string, option: string) {
    pickBranchAddress({ search, option });
  }

  /**
   * Maps the branch to a branch in the library system by its ISIL id.
   */
  selectAgencyBranch(isilId: string) {
    // The select2 widget is synced from the underlying select on submit.
    this.elements.agencyBranchField().select(isilId, { force: true });
  }

  save() {
    this.elements.saveButton().click();
  }
}
