import { PageObject, Elements } from '@hammzj/cypress-page-object';

export class LoginPage extends PageObject {
  public elements: Elements;

  constructor() {
    super({ path: '/user/login' });
    this.addElements = {
      form: () => cy.get('#user-login-form'),
      nameField: () => this.elements.form().find('[name="name"]'),
      passField: () => this.elements.form().find('[name="pass"]'),
      loginButton: () => this.elements.form().find('[value="Log in"]'),
    };
  }

  login(user: string, pass: string) {
    this.elements.nameField().type(user);
    this.elements.passField().type(pass);
    this.elements.loginButton().click();

    // In general, page objects shouldn't make assertions like this,
    // but we'll make an exception with login failure, to make it more
    // explicit for the developer what went wrong.
    cy.get('a[data-drupal-link-system-path="logout"]').should('exist');

    return this;
  }
}
