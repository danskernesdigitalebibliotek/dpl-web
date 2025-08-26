describe('Webforms', () => {
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
    cy.findByLabelText('Dit navn').then((element) => {
      expect(element[0].validationMessage).to.be.oneOf([
        'Udfyld dette felt.',
        'Please fill in this field.',
        'Please fill out this field.',
      ]);
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

  it('Check that EVAC email validation rejects invalid email addresses.', () => {
    cy.visit('/kontakt');
    cy.findByLabelText('Dit navn').type('John Doe');
    // Test with an obviously invalid email that should fail EVAC validation
    cy.findByLabelText('Din e-mailadresse').type(
      'invalid.email@nonexistent-domain.invalid',
    );
    cy.findByLabelText('Kategori').select(1);
    cy.findByLabelText('Emne').type('Test EVAC validation');
    cy.findByLabelText('Besked').type(
      'Testing email validation with EVAC module',
    );
    cy.findByRole('button', { name: 'Send besked' }).click();
    // EVAC should reject this email and cause form submission to fail
    cy.get('.error-message__description').contains(
      'is not valid. Use the format user@example.com',
    );
  });

  it('Create a new webform with textfield element.', () => {
    cy.drupalLogin('/admin/structure/webform/add');
    cy.findByLabelText('Title').type('Cypress Test Webform');
    cy.findByRole('button', { name: 'Save' }).click();
    cy.url().should(
      'match',
      /admin\/structure\/webform\/manage\/cypress_test_webform/,
    );
    cy.get('a#webform-ui-add-element').click();
    cy.get(
      'a[data-drupal-selector="edit-elements-textfield-operation"]',
    ).click();
    cy.get('input[data-drupal-selector="title"]').type('Test text field');
    cy.findByRole('button', { name: 'Save' }).click();
  });

  it('Can add a new email handler to an existing webform.', () => {
    cy.drupalLogin('/admin/structure/webform');
    cy.get('td')
      .contains('Cypress Test Webform')
      .closest('tr')
      .contains('li > a', 'Build')
      // Use force to bypass sticky table header.
      .click({ force: true });
    cy.get('.tabs__link').contains('Settings').click();
    cy.get('.tabs__link').contains('Emails / Handlers').click();
    cy.get('.local-actions__item').contains('Add email').click();
    cy.findByLabelText('Title').clear();
    cy.findByLabelText('Title').type('Cypress Test Email Handlers');
    cy.findByRole('button', { name: 'Save' }).click();
  });

  it('Can delete an existing webform.', () => {
    cy.drupalLogin('/admin/structure/webform');
    cy.get('[data-drupal-selector="edit-items-cypress-test-webform"]').click();
    cy.findByLabelText('Action').select('Delete webform');
    cy.findAllByRole('button', {
      name: 'Apply to selected items',
    })
      .first()
      .click();
    cy.findByLabelText('Warning message').contains(
      'Are you sure you want to delete this webform?',
    );
    cy.findByLabelText('Yes, I want to delete this webform.').click();
    cy.findByRole('button', { name: 'Delete' }).click();
    cy.findByLabelText('Status message').contains('Deleted 1 item');
  });
});
