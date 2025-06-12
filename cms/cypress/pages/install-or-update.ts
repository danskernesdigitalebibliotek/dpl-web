import { PageObject, Elements } from '@hammzj/cypress-page-object';

export class InstallOrUpdatePage extends PageObject {
  public elements: Elements;

  constructor() {
    super({ path: '/admin/modules/install-or-update' });
    this.addElements = {
      form: () => cy.get('form#dpl-webmaster-upload-form'),
      fileField: () => this.elements.form().find('#edit-project-upload'),
      submit: () => this.elements.form().find('input[type=submit]'),
    };
  }

  uploadModule(fixture: string) {
    this.elements.fileField().selectFile(fixture);
    this.elements.submit().click();

    // This is convoluted because we're in the middle of refactoring
    // the form.
    cy.get('body')
      .then(($body) => {
        if ($body.find('table.module-list').length) {
          // The new version just redirects to the module list with a message.
          cy.get('.messages-list').contains('sucessfully uploaded. You can now enable it below.').should('exist');
          return false;
        }

        return true;
      })
      .then((isUpdate) => {
        if (isUpdate) {
          cy.get('.content').then(($content) => {
            if ($content.find('a:contains("Apply pending updates")').length) {
              return true;
            }

            return false;
          })
            .then((hasDbUpdates) => {
              if (hasDbUpdates) {
                // Review updates page.
                cy.get('a:contains("Apply pending updates")').click();

                // And wait for the Review log page.
                cy.get('a:contains("Front page")');
              }
            });
        }
      });
  }
}
