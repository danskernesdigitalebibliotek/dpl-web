import { LoginPage } from '../../pages/login-page';
import { AdminUrlProxy } from '../../pages/admin-url-proxy';
import { WorkPage } from '../../pages/work-page';

const checkThatUrlIsProxied = () => {
  cy.origin('https://www.google.com', () => {
    cy.url().should(
      'to.match',
      // Using `new RegExp` rather than `//` to avoid excessive
      // backslash escaping.
      new RegExp(
        '^https://www.google.com/\\?q=https://www.pressreader.com/9gva$',
      ),
    );
  });
};

describe.skip('Proxy URL replacement', () => {
  before(() => {
    LoginPage.ensureLogin(
      Cypress.env('DRUPAL_USERNAME'),
      Cypress.env('DRUPAL_PASSWORD'),
    );

    // Setup google as a "proxy" so we have something to test for.
    const adminPage = new AdminUrlProxy();
    adminPage.visit(['']);
    adminPage.configureProxyServerURLPrefix('https://www.google.com/?q=');
    adminPage.configureHostname('www.pressreader.com');

    adminPage.saveConfiguration();
  });

  beforeEach(() => {
    cy.viewport(1280, 720);
  });

  it('Returns the proxied URL for anonymous users', () => {
    LoginPage.anonymousUser();

    cy.intercept('GET', '/dpl-url-proxy*').as('proxyUrlRequest');
    const workPage = new WorkPage();

    workPage.visit(['work-of:150060-pressdisp:9GVA']);
    cy.wait('@proxyUrlRequest');
    workPage.gotoOnline();

    checkThatUrlIsProxied();
  });

  it('Returns the proxied URL for authenticated users', () => {
    LoginPage.ensureLogin(
      Cypress.env('DRUPAL_USERNAME'),
      Cypress.env('DRUPAL_PASSWORD'),
    );

    cy.intercept('GET', '/dpl-url-proxy*').as('proxyUrlRequest');

    const workPage = new WorkPage();
    workPage.visit(['work-of:150060-pressdisp:9GVA']);
    cy.wait('@proxyUrlRequest');
    workPage.gotoOnline();

    checkThatUrlIsProxied();
  });
});
