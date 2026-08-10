import * as dayjs from 'dayjs';
import 'cypress-if';
import { typeInCkEditor } from '../../helpers/helper-ckeditor';

// When an editor changes the recurrence of an event series, the occurrences the
// change does not touch have to come out the other side as the same event
// instances. Their IDs are public API - they are the event URLs, and the IDs
// exposed through /api/v1/events - and an occurrence can carry data of its own
// that exists nowhere else.
//
// Occurrences the change *does* remove have to be gone, so a series is both
// extended and shrunk back here to cover the two directions.

const branch = 'Det virtuelle bibliotek';
const seriesTitle = 'Reconciled weekly series';
const keptInstanceTitle = 'Kept instance';

// All Mondays, so a weekly series recurring on Mondays hits them exactly. The
// series is created ending on the third Monday, extended to the fourth and then
// shrunk back, which leaves the earlier occurrences untouched throughout.
const firstMonday = dayjs('2030-01-07');
const thirdMonday = dayjs('2030-01-21');
const fourthMonday = dayjs('2030-01-28');

const weeklyEndDate =
  '[data-drupal-selector="edit-weekly-recurring-date-0-end-value-date"]';

// Every eventseries form needs these before it will save.
const fillRequiredSeriesFields = (title: string) => {
  cy.findByLabelText('Title').type(title);
  cy.findByLabelText('Subtitle').type('A subtitle');
  cy.findByLabelText('Recur Type').select('Weekly Event', {
    // We have to use force when using Select2.
    force: true,
  });
  typeInCkEditor('Hello, world!');
  cy.findByLabelText('Branch').select(branch, {
    // We have to use force when using Select2.
    force: true,
  });
};

// Saving a series whose recurrence configuration changed puts the form into a
// second step, which has to be confirmed before the change is applied.
const setRecurrenceEndDate = (seriesId: string, date: dayjs.Dayjs) => {
  cy.visit(`/events/series/${seriesId}/edit`);
  cy.get(weeklyEndDate).clear();
  cy.get(weeklyEndDate).type(date.format('YYYY-MM-DD'));

  cy.clickSaveButton();
  cy.contains('Confirm Date Changes').should('be.visible');
  cy.get('#edit-confirm').click({
    // The sticky Gin action bar can overlap the inline confirm button.
    force: true,
  });
};

// Front-end event URLs are path aliases, so they carry no entity ID. Admin links
// to the same entity are built from the internal paths, so read the ID off the
// series edit tab instead.
const seriesIdFromPage = () =>
  cy
    .get('a[href^="/events/series/"][href$="/edit"]')
    .first()
    .invoke('attr', 'href')
    .then((href) => {
      const match = /\/events\/series\/(\d+)/.exec(String(href));

      if (!match) {
        throw new Error(`Expected to find a series ID in "${href}"`);
      }

      return match[1];
    });

// The "Edit Instances" tab lists every instance of the series with its entity ID
// in a column of its own, which is the cheapest way to observe whether instances
// were replaced.
const readInstanceIds = (seriesId: string) => {
  cy.visit(`/events/series/${seriesId}/edit-instances`);

  return cy
    .get('td.views-field-id')
    .then((cells) => cells.toArray().map((cell) => cell.innerText.trim()));
};

const deleteSeriesIfExists = (title: string) => {
  cy.drupalLogin('/admin/content/eventseries');
  cy.get('tr')
    .contains(title)
    // Empty if: we don't want a failing test if the item does not exist.
    .if()
    .each(() => {
      cy.get(`a[aria-label="Delete ${title}"]`).first().click({ force: true });

      cy.findByRole('dialog').findByRole('button', { name: 'Delete' }).click();
    });
};

describe('Event instance preservation', () => {
  it('only creates and deletes the instances that actually changed', () => {
    // The weekly recurring widget emits uncaught JS warnings - unrelated to what
    // we're testing.
    Cypress.on('uncaught:exception', () => false);

    cy.drupalLogin('/events/add/default');
    fillRequiredSeriesFields(seriesTitle);

    cy.get(
      '[data-drupal-selector="edit-weekly-recurring-date-0-value-date"]',
    ).type(firstMonday.format('YYYY-MM-DD'));
    cy.get(weeklyEndDate).type(thirdMonday.format('YYYY-MM-DD'));
    cy.get('[name="weekly_recurring_date[0][days][monday]"]').check();

    cy.clickSaveButton();

    // A series with several upcoming instances stays on the series page.
    seriesIdFromPage().then((seriesId) => {
      readInstanceIds(seriesId).then((originalIds) => {
        cy.log(`Series ${seriesId} has instances ${originalIds.join(', ')}.`);

        // Guard the test itself: without several instances there is nothing to
        // preserve, and the assertions below would pass trivially.
        expect(originalIds.length).to.be.at.least(2);

        const keptId = originalIds[0];

        cy.log(
          'Give the first instance a title of its own, so we can tell whether instance-only data survives.',
        );
        cy.visit(`/events/${keptId}/edit`);
        cy.get('[name="field_event_title[0][value]"]').type(keptInstanceTitle);
        cy.clickSaveButton();

        cy.log(
          'Extending the recurrence by one Monday adds one occurrence and leaves the existing ones as they are.',
        );
        setRecurrenceEndDate(seriesId, fourthMonday);
        readInstanceIds(seriesId)
          .should('include.members', originalIds)
          .and('have.length', originalIds.length + 1);

        cy.log(
          'Shrinking it back again drops that occurrence, and only that one.',
        );
        setRecurrenceEndDate(seriesId, thirdMonday);
        readInstanceIds(seriesId).should('have.members', originalIds);

        cy.log('The instance-only title survived all of it.');
        cy.visit(`/events/${keptId}/edit`);
        cy.get('[name="field_event_title[0][value]"]').should(
          'have.value',
          keptInstanceTitle,
        );
      });
    });
  });

  before(() => {
    deleteSeriesIfExists(seriesTitle);
  });

  after(() => {
    deleteSeriesIfExists(seriesTitle);
  });
});
