import { PageObject, Elements } from '@hammzj/cypress-page-object';

export class LoginPage extends PageObject {
  public elements: Elements;

  constructor() {
    super({ path: '/user/login' });
    this.addElements = {
      form: () => cy.get('#user-login-form'),
      nameField: () =>
        this.elements.form().findByRole('textbox', { name: /Username/i }),
      // There's no password role, so we just get it by label.
      passField: () => this.elements.form().findByLabelText('Password'),
      loginButton: () =>
        this.elements.form().findByRole('button', { name: /Log in/i }),
    };
  }

  login(user: string, pass: string) {
    this.elements.nameField().type(user);
    this.elements.passField().type(pass);
    this.elements.loginButton().click();
  }

  static ensureLogin(user: string, pass: string) {
    cy.session({ user, pass }, () => {
      const loginPage = new LoginPage();
      loginPage.visit([]);
      loginPage.login(user, pass);

      // In general, page objects shouldn't make assertions like this,
      // but we'll make an exception with login failure, to make it more
      // explicit for the developer what went wrong.
      cy.get('a[data-drupal-link-system-path="logout"]').should('exist');
    });
  }
}
