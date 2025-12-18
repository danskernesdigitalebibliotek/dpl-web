import { LoginPage } from '../../pages/login-page';
import { AdminModulesPage } from '../../pages/admin-modules';
import { AdminModulesUninstallPage } from '../../pages/admin-modules-uninstall';
import { InstallOrUpdatePage } from '../../pages/install-or-update';
import { TestModulePage } from '../../pages/test-module-page';

describe('Webmaster', () => {
  beforeEach(() => {
    // Obviously we need to be logged in to upload a module.
    LoginPage.ensureLogin(
      Cypress.env('DRUPAL_USERNAME'),
      Cypress.env('DRUPAL_PASSWORD'),
    );

    // Intuitively it makes most sense to clean up after a test after
    // it is run, but after hooks might not be called if the test
    // fails hard enough. So ensure a pristine environment before
    // running the test instead.
    const adminModulesPage = new AdminModulesPage();
    adminModulesPage.visit([]);
    adminModulesPage.moduleExists('test_module').then((exists) => {
      if (exists) {
        adminModulesPage.moduleEnabled('test_module').then((enabled) => {
          if (enabled) {
            const adminModulesUninstallPage = new AdminModulesUninstallPage();
            adminModulesUninstallPage.visit([]);
            adminModulesUninstallPage.uninstallModule('test_module');
          }
        });

        // Remove the module files, so we're starting all fresh.
        cy.exec('rm -rf web/modules/local/test_module');
      }
    });

    // Check that the module doesn't exist. We need this to ensure
    // Cypress is done running the above.
    adminModulesPage.visit([]);
    adminModulesPage.moduleExists('test_module').should('be.false');
  });

  it('can upload and enable a module', () => {
    const installOrUpdatePage = new InstallOrUpdatePage();
    installOrUpdatePage.visit([]);
    installOrUpdatePage.uploadModule(
      'cypress/fixtures/test_module/v1.0.0/test_module.tar.gz',
    );

    const adminModulesPage = new AdminModulesPage();
    adminModulesPage.visit([]);
    adminModulesPage.moduleExists('test_module').should('be.true');
    adminModulesPage.moduleEnabled('test_module').should('be.false');

    adminModulesPage.enableModule('test_module');
    adminModulesPage.moduleEnabled('test_module').should('be.true');

    const testModulePage = new TestModulePage();
    testModulePage.visit([]);
    testModulePage.version().should('contain', '1.0.0');
  });

  it('can update a module', () => {
    // Ensure that there's an existing module.
    const installOrUpdatePage = new InstallOrUpdatePage();
    installOrUpdatePage.visit([]);
    installOrUpdatePage.uploadModule(
      'cypress/fixtures/test_module/v1.0.0/test_module.tar.gz',
    );

    const adminModulesPage = new AdminModulesPage();
    adminModulesPage.visit([]);
    adminModulesPage.enableModule('test_module');

    const testModulePage = new TestModulePage();
    testModulePage.visit([]);
    testModulePage.version().should('contain', '1.0.0');
    testModulePage.updb().should('contain', 'null');

    // And try and update it.
    installOrUpdatePage.visit([]);
    installOrUpdatePage.uploadModule(
      'cypress/fixtures/test_module/v1.0.1/test_module.tar.gz',
    );

    testModulePage.visit([]);
    testModulePage.version().should('contain', '1.0.1');
    testModulePage.updb().should('contain', '10001');
  });
});
