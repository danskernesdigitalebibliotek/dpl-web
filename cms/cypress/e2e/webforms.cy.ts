describe('Webforms', () => {
  before(() => {
    cy.enableDevelMailLog();
  });

  it('Go to the default contact webform page and fill it out successfully.', () => {
    cy.visit('/kontakt');
    cy.findByLabelText('Dit navn').type('John Doe');
    cy.findByLabelText('Din e-mailadresse').type('john@doe.com');
    cy.findByLabelText('Kategori').select(1);
    cy.findByLabelText('Emne').type('Test');
    cy.findByLabelText('Besked').type('Lorem ipsum');
    // We bypass the linting here, as we need to force waiting as we need to
    // wait for the honeypot timer to run out.
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(6000);
    cy.findByRole('button', { name: 'Send besked' }).click();
    cy.get('.status-message__description').contains(
      'Your submission has been received. You will receive a confirmation mail soon.',
    );
  });

  it('Go to the default contact webform page and check that required fields are working.', () => {
    cy.visit('/kontakt');
    cy.findByRole('button', { name: 'Send besked' }).click();
    cy.findByLabelText('Dit navn').then(($input) => {
      expect($input[0].validationMessage).to.eq('Please fill in this field.');
    });
  });

  it('Check that antibot_key input element exists.', () => {
    cy.visit('/kontakt');
    cy.get('input[name="antibot_key"]').should('exist');
  });

  it('Check that honeypot_time input elements exists.', () => {
    cy.visit('/kontakt');
    cy.get('input[name="honeypot_time"]').should('exist');
  });

  it('Check that the honeypot timer is working by submitting form before timer (5000ms) is up.', () => {
    cy.visit('/kontakt');
    cy.findByLabelText('Dit navn').type('John Doe');
    cy.findByLabelText('Din e-mailadresse').type('john@doe.com');
    cy.findByLabelText('Kategori').select(1);
    cy.findByLabelText('Emne').type('Test');
    cy.findByLabelText('Besked').type('Lorem ipsum');
    cy.findByRole('button', { name: 'Send besked' }).click();
    cy.get('.error-message__description').contains(
      'There was a problem with your form submission.',
    );
  });

  it('Check that the honeypot field is working by filling in hidden honeypot field.', () => {
    cy.visit('/kontakt');
    cy.findByLabelText('Dit navn').type('John Doe');
    cy.findByLabelText('Din e-mailadresse').type('john@doe.com');
    cy.findByLabelText('Kategori').select(1);
    cy.findByLabelText('Emne').type('Test');
    cy.findByLabelText('Besked').type('Lorem ipsum');
    cy.findByLabelText('Leave this field blank').type('John Doe', {
      force: true,
    });
    // We bypass the linting here, as we need to force waiting as we need to
    // wait for the honeypot timer to run out.
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(6000);
    cy.findByRole('button', { name: 'Send besked' }).click();
    cy.get('.error-message__description').contains(
      'There was a problem with your form submission.',
    );
  });
});
