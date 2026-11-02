import * as dayjs from 'dayjs';
import 'dayjs/locale/da';
import { EventAddPage } from '../../pages/event-add';
import { LoginPage } from '../../pages/login-page';
import { EventSeriesListPage } from '../../pages/event-series-list';

const login = () =>
  LoginPage.ensureLogin(
    Cypress.env('DRUPAL_USERNAME'),
    Cypress.env('DRUPAL_PASSWORD'),
  );

// Two events in different months, so the events overview must render a month
// separator for each. Titles are unique so the AJAX search can filter down to
// a single, predictable result.
const separatorEvents = {
  first: {
    title: 'Month separator alpha event',
    subtitle: 'A subtitle',
    start: dayjs('2035-03-05T10:15:00'),
    end: dayjs('2035-03-05T12:15:00'),
  },
  second: {
    title: 'Month separator beta event',
    subtitle: 'A subtitle',
    start: dayjs('2035-04-10T10:15:00'),
    end: dayjs('2035-04-10T12:15:00'),
  },
};

// An anchored, case-insensitive regex matching any of the given month names.
// A month separator renders as its bare month name (the year is dropped as
// visual noise - grouping keys off a hidden 'Y-m' attribute instead), and the
// site formats month names in its own language (Danish locally, English in
// CI), so callers pass every locale variant they want to accept. Anchoring
// keeps it from matching event dates like "5. marts 2035".
const monthNameRegex = (names: string[]) =>
  new RegExp(`^(${names.join('|')})$`, 'i');

// A specific event's month name, in either locale.
const monthLabel = (date: dayjs.Dayjs) =>
  monthNameRegex(
    ['en', 'da'].map((locale) => date.locale(locale).format('MMMM')),
  );

// Any of the twelve month names, in either locale. Used to assert separators
// render without depending on which events happen to be on the first page.
const anyMonthLabel = monthNameRegex(
  ['en', 'da'].flatMap((locale) =>
    // .date(1) first so setting the month never overflows into the next one
    // (e.g. on the 31st, month(1) → "31 Feb" → March).
    Array.from({ length: 12 }, (_, month) =>
      dayjs().locale(locale).date(1).month(month).format('MMMM'),
    ),
  ),
);

// Match the separator element itself, not just its text. The exposed date
// filter renders a flatpickr calendar whose month dropdown holds all twelve
// month names as bare options, so an unscoped text match would hit those too:
// it would make a single-month lookup ambiguous, and - worse - let the
// "separators render" assertion pass on flatpickr's options alone, even with
// the separators gone entirely.
const separatorOptions = { selector: '.content-list__month-separator' };

const createSingleEvent = (event: (typeof separatorEvents)['first']) => {
  login();
  const eventAdd = new EventAddPage();
  eventAdd.visit([]);
  eventAdd.fillTitle(event.title);
  eventAdd.fillSubtitle(event.subtitle);
  eventAdd.selectRecurType('Custom/Single Event');
  eventAdd.fillBody('Hello, world!');
  eventAdd.selectBranch('Det virtuelle bibliotek');
  eventAdd.fillSingleDate(event.start, event.end);
  eventAdd.save();
};

const deleteEventSeries = (title: string) => {
  login();
  new EventSeriesListPage().deleteAllTitled(title);
};

describe('Events overview month separators', () => {
  before(() => {
    deleteEventSeries(separatorEvents.first.title);
    deleteEventSeries(separatorEvents.second.title);
    createSingleEvent(separatorEvents.first);
    createSingleEvent(separatorEvents.second);
    // The events search index has index_directly enabled, so the new events
    // are searchable as soon as they are saved - no cron run needed.
  });

  after(() => {
    deleteEventSeries(separatorEvents.first.title);
    deleteEventSeries(separatorEvents.second.title);
  });

  it('renders labelled month separators on the overview', () => {
    // GIVEN an anonymous visitor on the events overview
    cy.anonymousUser();
    cy.visit('/arrangementer');

    // THEN at least one month heading is rendered, and it carries a real label
    // (a separator rendered as an empty line would not match the pattern).
    cy.findAllByText(anyMonthLabel, separatorOptions).should(
      'have.length.at.least',
      1,
    );
    cy.findAllByText(anyMonthLabel, separatorOptions)
      .first()
      .should('be.visible');
  });

  it('keeps the month separator after filtering the list over AJAX', () => {
    // GIVEN an anonymous visitor on the events overview
    cy.anonymousUser();
    cy.visit('/arrangementer');

    // WHEN the list is filtered via the exposed search, which re-renders the
    // list over AJAX without a full page load (pressing Enter submits it)
    cy.findByPlaceholderText(/^(søg|search)$/i).type(
      `${separatorEvents.second.title}{enter}`,
    );

    // THEN the filtered result shows our event...
    cy.findByRole('heading', {
      name: new RegExp(separatorEvents.second.title, 'i'),
    }).should('be.visible');

    // ...AND its month separator is still rendered. It would be missing if the
    // separator behaviour didn't re-run after the AJAX refresh, or rendered
    // without its label.
    cy.findByText(
      monthLabel(separatorEvents.second.start),
      separatorOptions,
    ).should('be.visible');
  });
});
