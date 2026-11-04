import * as dayjs from 'dayjs';
import 'dayjs/locale/da';
import { EventAddPage } from '../../pages/event-add';
import { LoginPage } from '../../pages/login-page';
import { EventInstanceEditPage } from '../../pages/event-instance-edit';
import { EventInstancesPage } from '../../pages/event-instances';
import {
  EventLocationComponent,
  FreetextAddress,
} from '../../pages/event-location';
import { EventSeriesListPage } from '../../pages/event-series-list';
import { EventSeriesPage } from '../../pages/event-series';

const login = () =>
  LoginPage.ensureLogin(
    Cypress.env('DRUPAL_USERNAME'),
    Cypress.env('DRUPAL_PASSWORD'),
  );

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
    daysOfWeek: ['monday' as const, 'thursday' as const],
  },
};

// The site renders dates in its own language — Danish locally, English in CI —
// while dayjs formats in English by default. Build a regex that matches the
// date in either locale so assertions don't depend on the running language.
const dateInAnyLocale = (date: dayjs.Dayjs, format: string) => {
  const escape = (value: string) =>
    value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const variants = ['en', 'da'].map((locale) =>
    escape(date.locale(locale).format(format)),
  );
  return new RegExp(variants.join('|'));
};

const branch = 'Det virtuelle bibliotek';

// Starts adding an event, with the fields every event form needs before it
// will save.
const startEvent = (event: { title: string; subtitle: string }) => {
  login();
  const eventAdd = new EventAddPage();
  eventAdd.visit([]);
  eventAdd.fillTitle(event.title);
  eventAdd.fillSubtitle(event.subtitle);
  eventAdd.fillBody('Hello, world!');
  eventAdd.selectBranch(branch);
  return eventAdd;
};

// Saves a repeating event and opens its first instance for editing.
//
// A Weekly Event spanning multiple days is used so the series produces more
// than one instance: Drupal redirects to the series page when an eventinstance
// has no siblings, which breaks the save/re-open flow.
const saveAndEditFirstInstance = (eventAdd: EventAddPage, title: string) => {
  eventAdd.fillWeeklyRecurrence({
    from: events.repeatingEvent.start,
    to: events.repeatingEvent.end,
    days: events.repeatingEvent.daysOfWeek,
  });
  eventAdd.save();

  new EventSeriesPage().seriesId().then((seriesId) => {
    const eventInstances = new EventInstancesPage();
    eventInstances.visit([seriesId]);
    eventInstances.editFirst(title);
  });

  return new EventInstanceEditPage();
};

describe('Events', () => {
  it('can be created with a single occurrence', () => {
    const eventAdd = startEvent(events.singleEvent);
    eventAdd.selectRecurType(events.singleEvent.recurType);
    eventAdd.fillSingleDate(events.singleEvent.start, events.singleEvent.end);
    eventAdd.save();

    // Ensure that the core data from the event is displayed on the resulting page.
    // @todo This should probably be replaced by a visual regression test.
    cy.contains(events.singleEvent.title);
    cy.contains(dateInAnyLocale(events.singleEvent.start, 'D. MMMM YYYY'));
    cy.contains(
      `${events.singleEvent.start.format(
        'HH:mm',
      )} - ${events.singleEvent.end.format('HH:mm')}`,
    );
  });

  it('prefills end date/time based on start date/time', () => {
    login();
    const eventAdd = new EventAddPage();
    eventAdd.visit([]);
    eventAdd.fillStartDate(events.singleEvent.start);
    eventAdd.elements.customToDateField().focus();
    eventAdd.elements
      .customToDateField()
      .should('have.value', events.singleEvent.start.format('YYYY-MM-DD'));
    eventAdd.elements.customToTimeField().focus();
    eventAdd.elements
      .customToTimeField()
      .should(
        'have.value',
        events.singleEvent.start.add(1, 'hour').format('HH:mm'),
      );
  });

  it('all-day event is respected', () => {
    const eventAdd = startEvent(events.singleEvent);
    eventAdd.selectRecurType(events.singleEvent.recurType);
    eventAdd.fillSingleDate(events.singleEvent.start, events.singleEvent.end);

    const warningText =
      'Any specific times below will be ignored when "All day" is enabled';

    cy.contains(warningText).should('not.be.visible');
    eventAdd.toggleAllDay();
    cy.contains(warningText).should('be.visible');

    eventAdd.save();

    cy.contains(events.singleEvent.start.format('HH:mm')).should('not.exist');
    cy.contains(/All day|Hele dagen/g).should('be.visible');
  });

  it('copying all values from series to instance', () => {
    // Ignore JS warnings, emitted from reccuring_events weekly input.
    Cypress.on('uncaught:exception', () => {
      return false;
    });

    login();
    const eventAdd = new EventAddPage();
    eventAdd.visit([]);
    eventAdd.addParagraph('Text body');
    eventAdd.fillTitle(events.repeatingEvent.title);
    eventAdd.fillSubtitle(events.repeatingEvent.subtitle);
    eventAdd.fillBody('Hello from series!');
    eventAdd.selectBranch(branch);

    const instanceEdit = saveAndEditFirstInstance(
      eventAdd,
      events.repeatingEvent.title,
    );
    // Checking that the values don't already exist (inheritance default)
    instanceEdit.elements.titleField().should('be.empty');
    cy.contains('Hello from series!').should('not.exist');

    // Getting values from the series.
    instanceEdit.insertValuesFromSeries();

    // Checking that the values have been set, and add instance-only changes.
    instanceEdit.elements
      .titleField()
      .should('contain.value', events.repeatingEvent.title);
    instanceEdit.typeTitle(' - instance');

    cy.contains('Hello from series!').should('exist');
    instanceEdit.fillParagraphText('Hello from instance!');
    instanceEdit.save();

    cy.go('back');

    // Checking that copying from series *without* overwriting respects values.
    instanceEdit.insertValuesFromSeries(false);

    cy.contains('Hello from instance!').should('exist');
    cy.contains('Hello from series!').should('not.exist');

    instanceEdit.elements
      .titleField()
      .should('have.value', `${events.repeatingEvent.title} - instance`);

    // Re-copying and overwriting from series.
    instanceEdit.insertValuesFromSeries(true);

    instanceEdit.elements.titleField().should('not.contain.value', `instance`);
    cy.contains('Hello from instance!').should('not.exist');
    cy.contains('Hello from series!').should('exist');
  });

  it('Location field flow works', () => {
    login();
    const eventAdd = new EventAddPage();
    eventAdd.visit([]);
    const location = eventAdd.location();

    cy.log(`
      Initially, no branch has been selected, so location/address should not be
      visible, but "non-branch location" can be visible.
    `);
    location.elements.locationField().should('not.be.visible');
    location.elements.addressWidget().should('not.be.visible');
    location.elements.overrideBranchAddressField().should('be.visible');

    cy.log(`
      Choosing to override the branch address should make the fields visible,
      and the location required.
    `);
    location.overrideBranchAddress();
    location.elements.locationField().should('be.visible');
    location.elements.locationField().should('have.attr', 'required');
    location.elements.addressWidget().should('be.visible');

    cy.log(
      `Selecting a branch should not have any affect on the surrounding fields.`,
    );
    eventAdd.selectBranch(branch);
    location.elements.locationField().should('be.visible');
    location.elements.locationField().should('have.attr', 'required');
    location.elements.addressWidget().should('be.visible');

    cy.log(
      `Setting the event to online should mean all location fields are hidden.`,
    );
    location.selectLocationType('online');
    location.elements.locationField().should('not.be.visible');
    location.elements.locationField().should('not.have.attr', 'required');
    location.elements.addressWidget().should('not.be.visible');
    location.elements.overrideBranchAddressField().should('not.be.visible');
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
    const customAddress: FreetextAddress = {
      street: 'Testvej 1',
      postalCode: '1000',
      postalName: 'Testby',
    };
    const emptyAddress: FreetextAddress = {
      street: '',
      postalCode: '',
      postalName: '',
    };

    // Create the parent series (branch set, no custom address) and open the
    // first instance for editing.
    const createSeriesAndOpenInstance = (title: string) => {
      // The weekly recurring widget emits uncaught JS warnings — unrelated to
      // what we're testing.
      Cypress.on('uncaught:exception', () => false);

      const eventAdd = startEvent({ title, subtitle: 'Hello, world!' });
      return saveAndEditFirstInstance(eventAdd, title);
    };

    // The custom-address widget is hidden by #states until location-type is
    // "In person" *and* the "override branch address" toggle is checked (see
    // dpl_event_form_alter). Reveal it so the freetext fields are interactive.
    // The freetext path of the address widget is used so the test doesn't
    // depend on the live address autocomplete endpoint.
    const revealCustomAddress = (location: EventLocationComponent) => {
      location.selectLocationType('physical');
      location.overrideBranchAddress();
      location.elements.addressWidget().should('be.visible');
    };

    it('keeps a custom address when the address widget is visible', () => {
      const title = `${seriesTitle} - kept`;
      const instanceEdit = createSeriesAndOpenInstance(title);
      const location = instanceEdit.location();

      cy.log('Reveal the custom-address widget and enter an address.');
      revealCustomAddress(location);
      location.fillFreetextAddress(customAddress);
      instanceEdit.save();

      cy.log(
        'Re-open the same instance and confirm the address survived presave.',
      );
      cy.go('back');
      location.freetextAddress().should('deep.equal', customAddress);
    });

    // Both "Online" and the empty "- None -" hide the address widget via
    // Drupal #states and must trigger the presave to drop the stored value.
    // They take different code paths internally (the empty branch used to
    // early-return), so we cover both.
    const hidingTransitions = [
      { label: 'Online', slug: 'online', radioValue: 'online' as const },
      { label: '"- None -"', slug: 'none', radioValue: '_none' as const },
    ];

    hidingTransitions.forEach(({ label, slug, radioValue }) => {
      it(`clears the address when location-type is set to ${label}`, () => {
        const title = `${seriesTitle} - cleared-${slug}`;
        const instanceEdit = createSeriesAndOpenInstance(title);
        const location = instanceEdit.location();

        cy.log('Save an address first so we have something to clear.');
        revealCustomAddress(location);
        location.fillLocation('Some location');
        location.fillFreetextAddress(customAddress);
        instanceEdit.save();

        cy.go('back');
        location.freetextAddress().should('deep.equal', customAddress);

        cy.log(`Switching to ${label} hides the widget, so presave clears it.`);
        location.selectLocationType(radioValue);
        location.elements.addressWidget().should('not.be.visible');
        instanceEdit.save();

        cy.go('back');
        location.freetextAddress().should('deep.equal', emptyAddress);
      });
    });

    after(() => {
      login();
      new EventSeriesListPage().deleteAllTitled(seriesTitle);
    });
  });

  before(() => {
    // Delete all preexisting instances of each event.
    login();
    new EventSeriesListPage().deleteAllTitled(events.singleEvent.title);
  });
});
