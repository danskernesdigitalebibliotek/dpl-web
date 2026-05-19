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
    cy.findByLabelText('Branch').select('Det virtuelle bibliotek', {
      // We have to use force when using Select2.
      force: true,
    });

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
    cy.findByLabelText('Branch').select('Det virtuelle bibliotek', {
      // We have to use force when using Select2.
      force: true,
    });

    setDate('Start date', events.singleEvent.start);
    setDate('End date', events.singleEvent.end);

    const warningText =
      'Any specific times below will be ignored when "All day" is enabled';

    cy.contains(warningText).should('not.be.visible');
    cy.findByLabelText('All day').click();
    cy.contains(warningText).should('be.visible');

    cy.clickSaveButton();

    cy.contains(events.singleEvent.start.format('HH:mm')).should('not.exist');
    cy.contains(/All day|Hele dagen/g).should('be.visible');
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
    cy.findByLabelText('Branch').select('Det virtuelle bibliotek', {
      // We have to use force when using Select2.
      force: true,
    });

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

  it('Location field flow works', () => {
    // Login as admin.
    cy.drupalLogin('/events/add/default');

    // Getting the relevant fields, we want to check.
    cy.get('[data-drupal-selector="edit-field-event-location-0-value"]').as(
      'location',
    );
    cy.get(
      '[data-drupal-selector="edit-field-event-address-gsearch-wrapper"]',
    ).as('address');
    cy.get(
      '[data-drupal-selector="edit-field-event-non-branch-location-value"]',
    ).as('non_branch');
    cy.get('[data-drupal-selector="edit-field-event-location-type-online"]').as(
      'online',
    );

    // Initially, no branch has been selected, so location fields should be
    // visible, and required.
    cy.get('@location').should('be.visible');
    cy.get('@location').should('have.attr', 'required');
    cy.get('@address').should('be.visible');
    cy.get('@non_branch').should('not.be.visible');

    // Selecting a branch should make the fields optional and hidden.
    cy.findByLabelText('Branch').select('Det virtuelle bibliotek', {
      // We have to use force when using Select2.
      force: true,
    });
    cy.get('@location').should('not.be.visible');
    cy.get('@location').should('not.have.attr', 'required');
    cy.get('@address').should('not.be.visible');
    cy.get('@non_branch').should('be.visible');

    // Choosing to override the branch address should make the fields visible.
    cy.get('@non_branch').click();
    cy.get('@location').should('be.visible');
    cy.get('@location').should('have.attr', 'required');
    cy.get('@address').should('be.visible');

    // Setting the event to online should mean all location fields are hidden.
    cy.get('@online').click();
    cy.get('@location').should('not.be.visible');
    cy.get('@location').should('not.have.attr', 'required');
    cy.get('@address').should('not.be.visible');
    cy.get('@non_branch').should('not.be.visible');
  });

  // Fields hidden by Drupal #states in dpl_event_form_alter() must also be
  // cleared by dpl_event_entity_presave() — otherwise stale values leak
  // through even though the user can no longer see them in the form. These
  // tests are written against the eventinstance form because that's where
  // both regressions surfaced:
  //
  //   1. Adding a custom address on an instance whose field_branch is empty
  //      (only inherited from the series) used to be wiped by the presave,
  //      because it inspected the inherited `branch` field instead of
  //      `field_branch`.
  //
  //   2. Changing location-type to the empty "- None -" option on an instance
  //      used to leave a previously-saved address untouched, because the
  //      presave early-returned on empty location_type.
  describe('Hidden location fields on eventinstance', () => {
    const seriesTitle = 'Hidden fields series';
    type Address = { street: string; postalCode: string; postalName: string };
    const customAddress: Address = {
      street: 'Testvej 1',
      postalCode: '1000',
      postalName: 'Testby',
    };
    const emptyAddress: Address = {
      street: '',
      postalCode: '',
      postalName: '',
    };

    const gsearchField = (suffix: string) =>
      cy.get(
        `[data-drupal-selector="edit-field-event-address-gsearch-0-${suffix}"]`,
      );
    const gsearchWrapper = () =>
      cy.get(
        '[data-drupal-selector="edit-field-event-address-gsearch-wrapper"]',
      );
    const locationTypeRadio = (value: string) =>
      cy.get(`input[name="field_event_location_type"][value="${value}"]`);

    // Use the freetext path of the gsearch widget so the test doesn't depend
    // on the live GSearch autocomplete endpoint.
    const fillFreetextAddress = (address: Address) => {
      gsearchField('main-enable-freetext').check();
      gsearchField('freetext-address').clear().type(address.street);
      gsearchField('freetext-postal-code').clear().type(address.postalCode);
      gsearchField('freetext-postal-name').clear().type(address.postalName);
    };

    const assertFreetextAddress = (address: Address) => {
      gsearchField('freetext-address').should('have.value', address.street);
      gsearchField('freetext-postal-code').should(
        'have.value',
        address.postalCode,
      );
      gsearchField('freetext-postal-name').should(
        'have.value',
        address.postalName,
      );
    };

    // Create the parent series (branch set, no custom address) and open the
    // first instance for editing. The series's branch is inherited by the
    // instance, but the instance's own field_branch stays empty, so the form's
    // #states show the custom-address widget — the condition both regressions
    // live under.
    //
    // A Weekly Event spanning multiple days is used so the series produces
    // more than one instance: Drupal redirects to the series page when an
    // eventinstance has no siblings, which breaks the save/re-open flow.
    const createSeriesAndOpenInstance = (title: string) => {
      // The weekly recurring widget emits uncaught JS warnings — unrelated to
      // what we're testing.
      Cypress.on('uncaught:exception', () => false);

      cy.drupalLogin('/events/add/default');
      cy.findByLabelText('Title').type(title);
      cy.findByLabelText('Subtitle').type('Hello, world!');
      cy.findByLabelText('Recur Type').select(events.repeatingEvent.recurType, {
        force: true,
      });
      typeInCkEditor('Hello, world!');
      cy.findByLabelText('Branch').select('Det virtuelle bibliotek', {
        force: true,
      });

      cy.get(
        '[data-drupal-selector="edit-weekly-recurring-date-0-value-date"]',
      ).type(events.repeatingEvent.start.format('YYYY-MM-DD'));
      cy.get(
        '[data-drupal-selector="edit-weekly-recurring-date-0-end-value-date"]',
      ).type(events.repeatingEvent.end.format('YYYY-MM-DD'));
      events.repeatingEvent.daysOfWeek.forEach((day) => {
        cy.get(`[name="weekly_recurring_date[0][days][${day}]"]`).check();
      });

      cy.clickSaveButton();

      cy.get('a[href^="/events/series"][href$="/edit"]').click({ force: true });
      cy.contains('Edit Instances').click();
      cy.get(`a[aria-label="Edit ${title}"]`).first().click();

      // field_event_location_type on eventinstance has no default, so a fresh
      // instance form lands on "- None -" which hides the address widget via
      // #states. Flip to "In person" so the rest of the test can interact.
      locationTypeRadio('physical').check();
    };

    it('keeps a custom address when the address widget is visible', () => {
      const title = `${seriesTitle} - kept`;
      createSeriesAndOpenInstance(title);

      gsearchWrapper().should('be.visible');
      fillFreetextAddress(customAddress);
      cy.clickSaveButton();

      // Re-open the same instance and confirm the address survived presave.
      cy.go('back');
      assertFreetextAddress(customAddress);
    });

    // Both "Online" and the empty "- None -" hide the address widget via
    // Drupal #states and must trigger the presave to drop the stored value.
    // They take different code paths internally (the empty branch used to
    // early-return), so we cover both.
    const hidingTransitions = [
      { label: 'Online', slug: 'online', radioValue: 'online' },
      { label: '"- None -"', slug: 'none', radioValue: '_none' },
    ];

    hidingTransitions.forEach(({ label, slug, radioValue }) => {
      it(`clears the address when location-type is set to ${label}`, () => {
        const title = `${seriesTitle} - cleared-${slug}`;
        createSeriesAndOpenInstance(title);

        // Save an address first so we have something to clear.
        cy.get(
          '[data-drupal-selector="edit-field-event-location-0-value"]',
        ).type('Some location');
        fillFreetextAddress(customAddress);
        cy.clickSaveButton();
        cy.go('back');
        assertFreetextAddress(customAddress);

        locationTypeRadio(radioValue).check();
        gsearchWrapper().should('not.be.visible');
        cy.clickSaveButton();

        cy.go('back');
        assertFreetextAddress(emptyAddress);
      });
    });

    after(() => {
      [
        `${seriesTitle} - kept`,
        `${seriesTitle} - cleared-online`,
        `${seriesTitle} - cleared-none`,
      ].forEach((title) => {
        cy.drupalLogin('/admin/content/eventseries');
        cy.get('tr')
          .contains(title)
          // Empty if: we don't want a failing test if the item does not exist.
          .if()
          .each(() => {
            cy.get(`a[aria-label="Delete ${title}"]`)
              .first()
              .click({ force: true });

            cy.findByRole('dialog')
              .findByRole('button', { name: 'Delete' })
              .click();
          });
      });
    });
  });

  before(() => {
    cy.drupalLogin('/admin/content/eventseries');
    // Delete all preexisting instances of each event.
    cy.get('tr')
      .contains(events.singleEvent.title)
      // Empty if: we don't want failing test if the item does not exist.
      .if()
      .each(() => {
        cy.get(`a[aria-label="Delete ${events.singleEvent.title}"]`)
          .first()
          .click({ force: true });

        cy.findByRole('dialog')
          .findByRole('button', { name: 'Delete' })
          .click();
      });
  });
});
