import { EventAddPage } from '../../pages/event-add';
import { LoginPage } from '../../pages/login-page';

describe('Event creation using page object', () => {
  beforeEach(() => {
    LoginPage.ensureLogin(
      Cypress.env('DRUPAL_USERNAME'),
      Cypress.env('DRUPAL_PASSWORD'),
    );
  });

  it('can create an event', () => {
    const eventAdd = new EventAddPage();
    eventAdd.visit([]);

    eventAdd.fillTitle('Test Event');
    eventAdd.fillSubtitle('This is a test subtitle');
    // Custom/Single Event should be default, so no need selectingit.
    eventAdd.selectBranch('Det virtuelle bibliotek');
    eventAdd.fillBody('Body text');

    eventAdd.elements.customFromDateField().type('2030-01-01');
    eventAdd.elements.customFromTimeField().type('10:00:00');
    eventAdd.elements.customToDateField().type('2030-01-01');
    eventAdd.elements.customToTimeField().type('12:00:00');

    eventAdd.save();

    // Check that the new page is the created event
    cy.contains('Test Event');
  });

  it('fails gracefully on missing time', () => {
    const eventAdd = new EventAddPage();
    eventAdd.visit([]);

    eventAdd.fillTitle('Test timeless Event');
    eventAdd.fillSubtitle('This is a test subtitle');
    // Custom/Single Event should be default, so no need selectingit.
    eventAdd.selectBranch('Det virtuelle bibliotek');
    eventAdd.fillBody('Body text');

    eventAdd.elements.customFromDateField().type('2030-01-01');
    eventAdd.elements.customToDateField().type('2030-01-01');

    eventAdd.save();

    // Check that we get a sensible error message.
    cy.contains(
      'The Start date date is invalid. Enter a date in the correct format.',
    );
    cy.contains(
      'The End date date is invalid. Enter a date in the correct format.',
    );
  });
});
