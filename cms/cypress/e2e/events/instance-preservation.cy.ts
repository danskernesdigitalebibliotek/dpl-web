import * as dayjs from 'dayjs';
import { EventAddPage } from '../../pages/event-add';
import { LoginPage } from '../../pages/login-page';
import { EventEditPage } from '../../pages/event-edit';
import { EventInstanceEditPage } from '../../pages/event-instance-edit';
import { EventInstancesPage } from '../../pages/event-instances';
import { EventSeriesListPage } from '../../pages/event-series-list';
import { EventSeriesPage } from '../../pages/event-series';

const login = () =>
  LoginPage.ensureLogin(
    Cypress.env('DRUPAL_USERNAME'),
    Cypress.env('DRUPAL_PASSWORD'),
  );

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

const setRecurrenceEndDate = (seriesId: string, date: dayjs.Dayjs) => {
  const eventEdit = new EventEditPage();
  eventEdit.visit([seriesId]);
  eventEdit.changeWeeklyEndDate(date);
  eventEdit.saveAndConfirmDateChanges();
};

const readInstanceIds = (seriesId: string) => {
  const eventInstances = new EventInstancesPage();
  eventInstances.visit([seriesId]);
  // The tab lists every instance of the series with its entity ID, which is
  // the cheapest way to observe whether instances were replaced.
  return eventInstances.instanceIds();
};

const deleteSeriesIfExists = (title: string) => {
  login();
  new EventSeriesListPage().deleteAllTitled(title);
};

describe('Event instance preservation', () => {
  it('only creates and deletes the instances that actually changed', () => {
    // The weekly recurring widget emits uncaught JS warnings - unrelated to what
    // we're testing.
    Cypress.on('uncaught:exception', () => false);

    login();
    const eventAdd = new EventAddPage();
    eventAdd.visit([]);
    eventAdd.fillTitle(seriesTitle);
    eventAdd.fillSubtitle('A subtitle');
    eventAdd.fillBody('Hello, world!');
    eventAdd.selectBranch(branch);
    eventAdd.fillWeeklyRecurrence({
      from: firstMonday,
      to: thirdMonday,
      days: ['monday'],
    });
    eventAdd.save();

    // A series with several upcoming instances stays on the series page.
    new EventSeriesPage().seriesId().then((seriesId) => {
      readInstanceIds(seriesId).then((originalIds) => {
        cy.log(`Series ${seriesId} has instances ${originalIds.join(', ')}.`);

        // Guard the test itself: without several instances there is nothing to
        // preserve, and the assertions below would pass trivially.
        expect(originalIds.length).to.be.at.least(2);

        const keptId = originalIds[0];

        cy.log(
          'Give the first instance a title of its own, so we can tell whether instance-only data survives.',
        );
        const instanceEdit = new EventInstanceEditPage();
        instanceEdit.visit([keptId]);
        instanceEdit.typeTitle(keptInstanceTitle);
        instanceEdit.save();

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
        instanceEdit.visit([keptId]);
        instanceEdit.elements
          .titleField()
          .should('have.value', keptInstanceTitle);
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
