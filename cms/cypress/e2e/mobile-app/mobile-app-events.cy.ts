// The mobile apps list the library's events from the /api/v1/events/happening
// REST endpoint, which the BFF behind them reads. A failure here means a change
// in the CMS will break the mobile apps.
import * as dayjs from 'dayjs';
import * as timezone from 'dayjs/plugin/timezone';
import * as utc from 'dayjs/plugin/utc';
import { BranchAddPage } from '../../pages/branch-add';
import { EventAddPage } from '../../pages/event-add';
import { LoginPage } from '../../pages/login-page';
import { EventSeriesListPage } from '../../pages/event-series-list';
import { NodePage } from '../../pages/node';

const login = () =>
  LoginPage.ensureLogin(
    Cypress.env('DRUPAL_USERNAME'),
    Cypress.env('DRUPAL_PASSWORD'),
  );

type Image = { url: string };

type HappeningEvent = {
  uuid: string;
  title: string;
  description?: string;
  url: string;
  created_at: string;
  updated_at: string;
  ticket_manager_relevance: boolean;
  image?: Image;
  originalImage?: Image;
  teaserImage?: Image;
  state: string;
  all_day: boolean;
  date_time: { start: string; end: string };
  branches: string[];
  branch_isil_ids: string[];
  organizer?: {
    id: string;
    name: string;
    url: string;
    street?: string;
    zip_code?: number;
    city?: string;
    country?: string;
    phone?: string;
    email?: string;
  };
  address: {
    locationType?: string;
    location?: string;
    street?: string;
    zip_code?: number;
    city?: string;
    country?: string;
  };
  categories: string[];
  audiences: string[];
  tags: string[];
  partners: string[];
  ticket_categories: {
    uuid: string;
    title: string;
    price: { currency: string; value: number };
  }[];
  ticket_capacity?: number;
  series?: { uuid: string };
  body?: string;
  external_data: { url?: string; admin_url?: string };
  screen_names: string[];
};

// What an editor fills in on the event form.
type EventInput = {
  title: string;
  subtitle: string;
  start: dayjs.Dayjs;
  end: dayjs.Dayjs;
};

// A branch from the FBS branches mock (wiremock). It is used by no branch node
// in the default content, nor by the other mobile app specs.
const isilId = 'FBS-751009';
// Matches every title the tests give branches and events, so cleaning up also
// removes those left behind by an earlier run.
const titlePrefix = 'test-mobile-app-events';
const branchPhone = '33 33 33 33';
const branchEmail = 'info+events@reload.dk';

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
// The apps cannot resolve relative URLs, so they must be absolute.
const absoluteUrl = (path = '') =>
  new RegExp(`^${Cypress.config('baseUrl')}/${path}`);

// The site runs in Danish time, and the endpoint returns times with the offset.
const isoTime = (time: dayjs.Dayjs) => time.format('YYYY-MM-DDTHH:mm:ssZ');

dayjs.extend(utc);
dayjs.extend(timezone);
// A time in Danish time, or now, whatever time zone the tests run in. The
// event form takes times in Danish time too.
const danishTime = (time?: string) =>
  time ? dayjs.tz(time, 'Europe/Copenhagen') : dayjs().tz('Europe/Copenhagen');

// The BFF reads events as an anonymous user.
const getHappeningEvents = () => {
  cy.clearCookies();
  return cy
    .request({
      url: '/api/v1/events/happening',
      qs: { _format: 'json' },
    })
    .then((response) => {
      expect(response.status).to.equal(200);
      return response.body as HappeningEvent[];
    });
};

// The events of the run, as titles are unique to it.
const getEventsTitled = (title: string) =>
  getHappeningEvents().then((events) =>
    events.filter((event) => event.title === title),
  );

const createBranch = (title: string) => {
  login();
  const branchAdd = new BranchAddPage();
  branchAdd.visit([]);
  branchAdd.fillTitle(title);
  branchAdd.fillContactInfo(branchEmail, branchPhone);
  branchAdd.pickAddress(
    'Ishøj Store Torv 1 2635',
    'Ishøj Store Torv 1, 2635 Ishøj',
  );
  branchAdd.selectAgencyBranch(isilId);
  branchAdd.save();

  const branchPage = new NodePage();
  branchPage.elements.hero().contains(title).should('be.visible');
  return branchPage.nodeId();
};

// Fills the fields every event form needs before it will save.
const startEvent = (
  { title, subtitle }: Pick<EventInput, 'title' | 'subtitle'>,
  branch: string,
) => {
  login();
  const eventAdd = new EventAddPage();
  eventAdd.visit([]);
  eventAdd.fillTitle(title);
  eventAdd.fillSubtitle(subtitle);
  eventAdd.fillBody('Brødtekst');
  eventAdd.selectBranch(branch);
  return eventAdd;
};

// Creates an event with a single occurrence.
const createEvent = (event: EventInput, branch: string) => {
  const eventAdd = startEvent(event, branch);
  eventAdd.fillSingleDate(event.start, event.end);
  eventAdd.save();
  cy.contains(event.title);
};

const deleteEventsIfExist = () => {
  login();
  const eventSeriesList = new EventSeriesListPage();
  eventSeriesList.deleteAllTitled(titlePrefix);
};

describe('Mobile app API: events', () => {
  const branchTitle = `${titlePrefix} branch ${Date.now()}`;
  // The branch is picked by ID, as the event form lists branches with their
  // address after the title.
  let branchId: string;

  before(() => {
    deleteEventsIfExist();
    cy.deleteEntitiesIfExists(titlePrefix);
    createBranch(branchTitle).then((id) => {
      branchId = id;
    });
  });

  after(() => {
    deleteEventsIfExist();
    cy.deleteEntitiesIfExists(titlePrefix);
  });

  it('returns an event an editor creates', () => {
    // Titles unique to the attempt, so events left behind by an earlier run or
    // attempt cannot make the tests pass.
    const runId = Date.now();
    const event: EventInput = {
      title: `${titlePrefix} ${runId}`,
      subtitle: 'Undertitel',
      start: danishTime('2030-04-01T10:00:00'),
      end: danishTime('2030-04-01T12:30:00'),
    };

    const eventAdd = startEvent(event, branchId);
    eventAdd.fillSingleDate(event.start, event.end);
    eventAdd.selectImages('paige-cody', 'paige-cody');
    eventAdd.fillPlace('Salen');
    // Events are relevant for ticket managers by default, which is when they
    // have a ticket capacity.
    eventAdd.fillTicketCapacity(50);
    eventAdd.addTicketCategory('Voksne', 75);
    eventAdd.fillPartner('Partneren');
    eventAdd.selectCategory('Litteratur');
    eventAdd.selectAudience('Børn');
    eventAdd.selectTag('læsning');
    eventAdd.save();
    cy.contains(event.title);

    getEventsTitled(event.title).then((events) => {
      expect(events).to.have.length(1);
      const [actual] = events;

      // Generated by the CMS, so we only know their format.
      expect(actual.uuid).to.match(uuidPattern);
      expect(actual.url).to.match(absoluteUrl());
      expect(dayjs(actual.created_at).isValid()).to.equal(true);
      expect(dayjs(actual.updated_at).isValid()).to.equal(true);
      expect(actual.series?.uuid).to.match(uuidPattern);
      expect(actual.organizer?.id).to.match(uuidPattern);
      expect(actual.organizer?.url).to.match(absoluteUrl());
      expect(actual.ticket_categories[0]?.uuid).to.match(uuidPattern);
      // The image URLs contain the upload date, so we only know which file
      // they are.
      expect(actual.image?.url).to.match(
        absoluteUrl('.*/event_api_scaled/.*paige-cody'),
      );
      expect(actual.originalImage?.url).to.match(absoluteUrl('.*paige-cody'));
      expect(actual.teaserImage?.url).to.match(
        absoluteUrl('.*/list_teaser_4_3/.*paige-cody'),
      );

      const branchAddress = {
        street: 'Ishøj Store Torv 1',
        zip_code: 2635,
        city: 'Ishøj',
        country: 'DK',
      };

      expect(actual).to.deep.equal({
        uuid: actual.uuid,
        title: event.title,
        description: event.subtitle,
        url: actual.url,
        created_at: actual.created_at,
        updated_at: actual.updated_at,
        ticket_manager_relevance: true,
        image: actual.image,
        originalImage: actual.originalImage,
        teaserImage: actual.teaserImage,
        state: 'Active',
        all_day: false,
        date_time: {
          start: isoTime(event.start),
          end: isoTime(event.end),
        },
        branches: [branchTitle],
        branch_isil_ids: [isilId],
        organizer: {
          id: actual.organizer?.id,
          name: branchTitle,
          url: actual.organizer?.url,
          ...branchAddress,
          phone: branchPhone,
          email: branchEmail,
        },
        // Without an address of its own, the event takes place at the branch.
        address: {
          locationType: 'physical',
          location: 'Salen',
          ...branchAddress,
        },
        categories: ['Litteratur'],
        audiences: ['Børn'],
        tags: ['læsning'],
        partners: ['Partneren'],
        ticket_categories: [
          {
            uuid: actual.ticket_categories[0]?.uuid,
            title: 'Voksne',
            price: { currency: 'DKK', value: 75 },
          },
        ],
        ticket_capacity: 50,
        series: actual.series,
        body: '<p>Brødtekst</p>',
        external_data: {},
        screen_names: [],
      });
    });
  });

  it('returns every occurrence of a weekly event', () => {
    // The weekly recurring widget emits uncaught JS warnings - unrelated to
    // what we're testing.
    Cypress.on('uncaught:exception', () => false);
    const runId = Date.now();
    const title = `${titlePrefix} weekly ${runId}`;
    // All Mondays.
    const mondays = [
      danishTime('2030-05-06T09:00:00'),
      danishTime('2030-05-13T09:00:00'),
      danishTime('2030-05-20T09:00:00'),
    ];

    const eventAdd = startEvent({ title, subtitle: 'Undertitel' }, branchId);
    eventAdd.fillWeeklyRecurrence({
      from: mondays[0],
      to: mondays[2],
      startTime: '09:00 am',
      endTime: '11:00 am',
      days: ['monday'],
    });
    eventAdd.save();
    cy.contains(title);

    getEventsTitled(title).then((events) => {
      expect(
        events.map(({ date_time }) => date_time),
        'the occurrences',
      ).to.deep.equal(
        mondays.map((start) => ({
          start: isoTime(start),
          end: isoTime(start.add(2, 'hour')),
        })),
      );
      // Each occurrence is an event of its own, in the same series.
      expect(new Set(events.map(({ uuid }) => uuid)).size).to.equal(3);
      expect(new Set(events.map(({ series }) => series?.uuid)).size).to.equal(
        1,
      );
    });
  });

  it('reflects an editor updating and deleting an event', () => {
    const runId = Date.now();
    const event: EventInput = {
      title: `${titlePrefix} update ${runId}`,
      subtitle: 'Undertitel',
      start: danishTime('2030-06-03T10:00:00'),
      end: danishTime('2030-06-03T12:00:00'),
    };
    const updatedTitle = `${titlePrefix} updated ${runId}`;

    createEvent(event, branchId);
    getEventsTitled(event.title).then((events) => {
      expect(events).to.have.length(1);
      expect(events[0].state).to.equal('Active');
    });

    login();
    const eventSeriesList = new EventSeriesListPage();
    eventSeriesList.visitSearch(event.title);
    const eventEdit = eventSeriesList.edit(event.title);
    eventEdit.fillTitle(updatedTitle);
    eventEdit.fillSubtitle('Ny undertitel');
    eventEdit.selectState('Cancelled');
    // Without a ticket manager, the event links to where tickets are sold.
    eventEdit.fillExternalTicketLink('https://example.com/billetter');
    eventEdit.save();
    cy.contains(updatedTitle);

    getEventsTitled(event.title).should('deep.equal', []);
    getEventsTitled(updatedTitle).then((events) => {
      expect(events).to.have.length(1);
      expect(events[0].description).to.equal('Ny undertitel');
      expect(events[0].state).to.equal('Cancelled');
      expect(events[0].ticket_manager_relevance).to.equal(false);
      expect(events[0].external_data).to.deep.equal({
        url: 'https://example.com/billetter',
      });
    });

    deleteEventsIfExist();
    getEventsTitled(updatedTitle).should('deep.equal', []);
  });

  it('returns ongoing events and leaves out those that have ended', () => {
    // The endpoint decides by the time of the request, so the events are
    // relative to now.
    const today = danishTime().startOf('hour');
    const runId = Date.now();
    const ended: EventInput = {
      title: `${titlePrefix} ended ${runId}`,
      subtitle: 'Undertitel',
      start: today.subtract(2, 'day'),
      end: today.subtract(2, 'day').add(1, 'hour'),
    };
    const ongoing: EventInput = {
      title: `${titlePrefix} ongoing ${runId}`,
      subtitle: 'Undertitel',
      start: today.subtract(1, 'day'),
      end: today.add(1, 'day'),
    };

    createEvent(ended, branchId);
    createEvent(ongoing, branchId);

    getEventsTitled(ended.title).should('deep.equal', []);
    getEventsTitled(ongoing.title).then((events) => {
      expect(events).to.have.length(1);
      expect(events[0].date_time).to.deep.equal({
        start: isoTime(ongoing.start),
        end: isoTime(ongoing.end),
      });
    });
  });
});
