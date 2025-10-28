import * as dayjs from 'dayjs';
import 'cypress-if';
import { typeInCkEditor } from '../helpers/helper-ckeditor';
import { addParagraph } from '../helpers/helper-paragraph';

const events = {
  singleEvent: {
    title: 'Single event',
    subtitle: 'A subtitle',
    recurType: 'Custom/Single Event',
    start: dayjs('2030-01-01T10:15:00'),
    end: dayjs('2030-01-01T16:15:00'),
  },
  repeatingEvent: {
    title: 'Repeating event',
    subtitle: 'A subtitle',
    recurType: 'Weekly Event',
    start: dayjs('2030-01-01'),
    end: dayjs('2030-01-30'),
    daysOfWeek: ['monday', 'thursday'],
  },
};

const setDate = (field: 'Start date' | 'End date', date: dayjs.Dayjs) => {
  cy.findByText(field)
    .siblings()
    .findByLabelText('Date')
    .type(date.format('YYYY-MM-DD'));
  cy.findByText(field)
    .siblings()
    .findByLabelText('Time')
    .type(date.format('HH:mm'));
};

describe('Events', () => {
  it('can be created with a single occurrence', () => {
    // Login as admin.
    cy.drupalLogin('/events/add/default');
    cy.findByLabelText('Title').type(events.singleEvent.title);
    cy.findByLabelText('Subtitle').type(events.singleEvent.subtitle);
    cy.findByLabelText('Recur Type').select(events.singleEvent.recurType, {
      // We have to use force when using Select2.
      force: true,
    });
    typeInCkEditor('Hello, world!');

    setDate('Start date', events.singleEvent.start);
    setDate('End date', events.singleEvent.end);
    cy.clickSaveButton();

    // Ensure that the core data from the event is displayed on the resulting page.
    // @todo This should probably be replaced by a visual regression test.
    cy.contains(events.singleEvent.title);
    cy.contains(events.singleEvent.start.format('D. MMMM YYYY'));
    cy.contains(
      `${events.singleEvent.start.format(
        'HH:mm',
      )} - ${events.singleEvent.end.format('HH:mm')}`,
    );
  });

  it('prefills end date/time based on start date/time', () => {
    // Login as admin.
    cy.drupalLogin('/events/add/default');
    setDate('Start date', events.singleEvent.start);
    cy.findByText('End date')
      .siblings()
      .findByLabelText('Date')
      .focus()
      .should('have.value', events.singleEvent.start.format('YYYY-MM-DD'));
    cy.findByText('End date')
      .siblings()
      .findByLabelText('Time')
      .focus()
      .should(
        'have.value',
        events.singleEvent.start.add(1, 'hour').format('HH:mm'),
      );
  });

  it('all-day event is respected', () => {
    // Login as admin.
    cy.drupalLogin('/events/add/default');

    cy.findByLabelText('Title').type(events.singleEvent.title);
    cy.findByLabelText('Subtitle').type(events.singleEvent.subtitle);
    cy.findByLabelText('Recur Type').select(events.singleEvent.recurType, {
      // We have to use force when using Select2.
      force: true,
    });
    typeInCkEditor('Hello, world!');

    setDate('Start date', events.singleEvent.start);
    setDate('End date', events.singleEvent.end);

    const warningText =
      'Any specific times below will be ignored when "All day" is enabled';

    cy.contains(warningText).should('not.be.visible');
    cy.findByLabelText('All day').click();
    cy.contains(warningText).should('be.visible');

    cy.clickSaveButton();

    cy.contains(events.singleEvent.start.format('HH:mm')).should('not.exist');
    cy.contains('All day').should('be.visible');
  });

  it('copying all values from series to instance', () => {
    cy.drupalLogin('/events/add/default');

    // Ignore JS warnings, emitted from reccuring_events weekly input.
    Cypress.on('uncaught:exception', () => {
      return false;
    });

    cy.openParagraphsModal();

    addParagraph('Text body');

    cy.findByLabelText('Title').type(events.repeatingEvent.title);
    cy.findByLabelText('Subtitle').type(events.repeatingEvent.subtitle);
    cy.findByLabelText('Recur Type').select(events.repeatingEvent.recurType, {
      // We have to use force when using Select2.
      force: true,
    });

    cy.get(
      '[data-drupal-selector="edit-weekly-recurring-date-0-end-value-date"]',
    ).type(events.repeatingEvent.end.format('YYYY-MM-DD'));
    cy.get(
      '[data-drupal-selector="edit-weekly-recurring-date-0-value-date"]',
    ).type(events.repeatingEvent.start.format('YYYY-MM-DD'));

    events.repeatingEvent.daysOfWeek.forEach((day) => {
      cy.get(`[name="weekly_recurring_date[0][days][${day}]"]`).check();
    });

    typeInCkEditor('Hello from series!');
    cy.clickSaveButton();

    // Editing a single instance.
    cy.get('a[href^="/events/series"][href$="/edit"]').click({
      // The admin toolbar gets in the way.
      force: true,
    });
    cy.contains('Edit Instances').click();
    cy.get(`a[aria-label="Edit ${events.repeatingEvent.title}"]`)
      .first()
      .click();

    // Checking that the values don't already exist (inheritance default)
    cy.get('[name="field_event_title[0][value]"]').should('be.empty');
    cy.contains('Hello from series!').should('not.exist');

    // Getting values from the series.
    cy.contains('Insert values from series').click();
    cy.contains('Insert values to instance').click();

    // Checking that the values have been set, and add instance-only changes.
    cy.get('[name="field_event_title[0][value]"]').should(
      'contain.value',
      events.repeatingEvent.title,
    );
    cy.get('[name="field_event_title[0][value]"]').type(' - instance');

    cy.contains('Hello from series!').should('exist');
    cy.get('[name="field_event_paragraphs_edit_all"]').click();
    typeInCkEditor('Hello from instance!');
    cy.clickSaveButton();

    cy.go('back');

    // Checking that copying from series *without* overwriting respects values.
    cy.contains('Insert values from series').click();
    cy.get('[data-drupal-selector="edit-overwrite-existing"]').uncheck();
    cy.contains('Insert values to instance').click();

    cy.contains('Hello from instance!').should('exist');
    cy.contains('Hello from series!').should('not.exist');

    cy.get('[name="field_event_title[0][value]"]').should(
      'have.value',
      `${events.repeatingEvent.title} - instance`,
    );

    // Re-copying and overwriting from series.
    cy.contains('Insert values from series').click();
    cy.get('[data-drupal-selector="edit-overwrite-existing"]').check();
    cy.contains('Insert values to instance').click();

    cy.get('[name="field_event_title[0][value]"]').should(
      'not.contain.value',
      `instance`,
    );
    cy.contains('Hello from instance!').should('not.exist');
    cy.contains('Hello from series!').should('exist');
  });

  before(() => {
    cy.drupalLogin('/admin/content/eventseries');
    // Delete all preexisting instances of each event.
    cy.get('a')
      .contains(events.singleEvent.title)
      .if()
      .each(() => {
        // We have to repeat the selector as Cypress will otherwise complain about
        // missing references to elements when clicking the page.
        cy.findAllByRole('link', { name: events.singleEvent.title })
          .first()
          .click();
        cy.findByRole('link', {
          name: `Edit ${events.singleEvent.title}`,
        }).click();
        cy.findByRole('button', { name: 'More actions' })
          .click()
          .parent()
          .findByRole('link', { name: 'Delete' })
          .click();
        cy.findByRole('dialog')
          .findByRole('button', { name: 'Delete' })
          .click();

        // Return to the event list to prepare for the next iteration.
        cy.visit('/admin/content/eventseries');
      });
  });
});
