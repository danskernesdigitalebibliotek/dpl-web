import { PageObject, Elements } from '@hammzj/cypress-page-object';

export class AdminModulesUninstallPage extends PageObject {
  public elements: Elements;

  constructor() {
    super({ path: '/admin/modules/uninstall' });
    this.addElements = {
      table: () => cy.get('table'),
      submit: () => cy.findByRole('button', { name: /Uninstall/i }),
    };
  }

  uninstallModule(module: string) {
    this.elements
      .table()
      .find('#edit-uninstall-' + this.htmlizeModule(module))
      .check();
    this.elements.submit().click();

    // Technically another page, but we'll handle it.
    cy.get('#system-modules-uninstall-confirm-form').then(() =>
      cy.findByRole('button', { name: /Uninstall/i }).click(),
    );
  }

  /**
   * Get module "HTML" name.
   *
   * Drupal munges the module name a bit in the attributes.
   */
  htmlizeModule(module: string): string {
    return module.replace('_', '-');
  }
}
