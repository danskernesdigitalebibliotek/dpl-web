import { PageObject, Elements } from '@hammzj/cypress-page-object';

export class AdminModulesPage extends PageObject {
  public elements: Elements;

  constructor() {
    super({ path: '/admin/modules' });
    this.addElements = {
      table: () => cy.get('table.module-list'),
      submit: () => cy.get('[value="Install"]'),
      moduleCheckbox: (module: string) =>
        this.elements.table().find(this.moduleCheckboxId(module)),
    };
  }

  enableModule(module: string) {
    // If the module has dependencies that needs to be enabled, this
    // needs to be extended to click confirm (see
    // AdminModulesUninstallPage.uninstallModule() for an example).
    this.elements.moduleCheckbox(module).check();
    this.elements.submit().click();
  }

  /**
   * Check if module exists.
   *
   * Yields true or false.
   */
  moduleExists(module: string) {
    return this.elements
      .table()
      .then(($table) => $table.find(this.moduleCheckboxId(module)).length > 0);
  }

  /**
   * Check if module is enabled.
   *
   * Yields true or false.
   */
  moduleEnabled(module: string) {
    return this.elements.table().then(($table) => {
      const checkbox = $table.find(this.moduleCheckboxId(module));
      return checkbox.length > 0 && checkbox.get(0).checked;
    });
  }

  /**
   * Get module checkbox HTML ID.
   *
   * Drupal munges the module name a bit in the ID attribute.
   */
  moduleCheckboxId(module: string): string {
    return '#edit-modules-' + module.replace('_', '-') + '-enable';
  }
}
