import { PageObject, Elements } from '@hammzj/cypress-page-object';

export class AdminUrlProxy extends PageObject {
  public elements: Elements;

  constructor() {
    super({ path: '/admin/config/services/dpl-url-proxy' });
    this.addElements = {
      form: () => cy.get('#proxy-url-configuration'),
      prefixField: () =>
        this.elements
          .form()
          .findByRole('textbox', { name: /Proxy server URL prefix/i }),
      // Actually the host configuration ought to be a repeatable
      // component, but we only need a single one to test, so keep it
      // simple.
      hostnameField: () =>
        this.elements.form().findByRole('textbox', { name: /Hostname/i }),
      submitButton: () =>
        this.elements.form().findByRole('button', { name: /Submit/i }),
    };
  }

  configureProxyServerURLPrefix(prefix: string) {
    this.elements.prefixField().clear().type(prefix);
  }

  configureHostname(hostname: string) {
    this.elements.hostnameField().clear().type(hostname);
  }

  saveConfiguration() {
    this.elements.submitButton().click();
  }
}
