describe('Webforms', () => {
  before(() => {
    cy.enableDevelMailLog();
  });

  beforeEach(() => {
    Cypress.session.clearAllSavedSessions();
  });

  it('Go to the default contact webform page and fill it out successfully.', () => {
    cy.visit('/kontakt');
    cy.url().should('match', /kontakt/);
    cy.get('[data-cy="name"]').type('John Doe');
    cy.get('[data-cy="email"]').type('john@doe.com');
    cy.get('[data-cy="category"]').select(1);
    cy.get('[data-cy="subject"]').type('Test');
    cy.get('[data-cy="message"]').type('Lorem ipsum');
    cy.wait(6000);
    cy.get('[data-cy="op"]').click();
    cy.url().should('match', /kontakt/);
    cy.get('.status-message__description').contains(
      'Your submission has been received. You will receive a confirmation mail soon.',
    );
  });

  it('Go to the default contact webform page and check that required fields are working.', () => {
    cy.visit('/kontakt');
    cy.url().should('match', /kontakt/);
    cy.get('[data-cy="op"]').click();
    cy.url().should('match', /kontakt/);
  });

  it('Check that antibot_key and honeypot_time input elements exists.', () => {
    cy.visit('/kontakt');
    cy.url().should('match', /kontakt/);
    cy.get('[data-cy="honeypot_time"]').should('exist');
    cy.get('[data-cy="antibot_key"]').should('exist');
  });

  it('Check that the honeypot timer is working by submitting form before timer (5000ms) is up.', () => {
    cy.visit('/kontakt');
    cy.url().should('match', /kontakt/);
    cy.get('[data-cy="name"]').type('John Doe');
    cy.get('[data-cy="email"]').type('john@doe.com');
    cy.get('[data-cy="category"]').select(1);
    cy.get('[data-cy="subject"]').type('Test');
    cy.get('[data-cy="message"]').type('Lorem ipsum');
    cy.get('[data-cy="op"]').click();
    cy.get('.error-message__description').contains(
      'There was a problem with your form submission.',
    );
  });

  it('Check that the honeypot field is working by filling in hidden honeypot field.', () => {
    cy.visit('/kontakt');
    cy.url().should('match', /kontakt/);
    cy.get('[data-cy="name"]').type('John Doe');
    cy.get('[data-cy="email"]').type('john@doe.com');
    cy.get('[data-cy="category"]').select(1);
    cy.get('[data-cy="subject"]').type('Test');
    cy.get('[data-cy="message"]').type('Lorem ipsum');
    cy.get('[data-cy="url"]').type('John Doe', { force: true });
    cy.wait(6000);
    cy.get('[data-cy="op"]').click();
    cy.get('.error-message__description').contains(
      'There was a problem with your form submission.',
    );
  });

  beforeEach(() => {
    cy.resetMappings();
  });

  afterEach(() => {
    cy.logMappingRequests();
  });
});
