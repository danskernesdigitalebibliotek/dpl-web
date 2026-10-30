// The mobile apps list the library's events from the /api/v1/events/happening
// REST endpoint, which the BFF behind them reads. A failure here means a change
// in the CMS will break the mobile apps.
import * as dayjs from 'dayjs';
import { pickBranchAddress } from '../../helpers/helper-branch';
import { typeInCkEditor } from '../../helpers/helper-ckeditor';
import { mediaLibrarySelect } from '../../helpers/helper-media';

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
  cy.drupalLogin('/node/add/branch');
  cy.get('#edit-title-0-value').type(title);
  cy.get('.meta-sidebar__trigger').click();
  cy.get('[name="field_email[0][value]"]').type(branchEmail);
  cy.get('[name="field_phone[0][value]"]').type(branchPhone);
  cy.get('.meta-sidebar__close').click();
  pickBranchAddress({
    search: 'Ishøj Store Torv 1 2635',
    option: 'Ishøj Store Torv 1, 2635 Ishøj',
  });
  // The select2 widget is synced from the underlying select on submit.
  cy.get('select[name="field_agency_branch_id"]').select(isilId, {
    force: true,
  });
  cy.clickSaveButton();
  cy.get('.hero').contains(title).should('be.visible');
  return cy
    .get('link[rel="shortlink"]')
    .invoke('attr', 'href')
    .then((nodePath) => String(nodePath).split('/').pop() as string);
};

// The fields every event form needs before it will save.
const fillRequiredEventFields = (
  { title, subtitle }: Pick<EventInput, 'title' | 'subtitle'>,
  branchId: string,
) => {
  cy.findByLabelText('Title').type(title);
  cy.findByLabelText('Subtitle').type(subtitle);
  typeInCkEditor('Brødtekst');
  // We have to use force when using Select2.
  cy.get('select[name="field_branch"]').select(branchId, { force: true });
};

const setCustomDate = (start: dayjs.Dayjs, end: dayjs.Dayjs) => {
  const field = (name: string) =>
    cy.get(`[data-drupal-selector="edit-custom-date-0-${name}"]`);
  field('value-date').type(start.format('YYYY-MM-DD'));
  field('value-time').type(start.format('HH:mm'));
  field('end-value-date').type(end.format('YYYY-MM-DD'));
  field('end-value-time').type(end.format('HH:mm'));
};

// Creates an event with a single occurrence.
const createEvent = (event: EventInput, branchId: string) => {
  cy.drupalLogin('/events/add/default');
  fillRequiredEventFields(event, branchId);
  setCustomDate(event.start, event.end);
  cy.clickSaveButton();
  cy.contains(event.title);
};

const deleteEventsIfExist = () => {
  cy.drupalLogin(`/admin/content/eventseries?search=${titlePrefix}`);
  cy.get('body').then(($body) => {
    const deletePaths = $body
      .find(`a[aria-label^="Delete ${titlePrefix}"]`)
      .toArray()
      .map((link) => link.getAttribute('href') as string);

    deletePaths.forEach((path) => {
      cy.visit(path);
      cy.get('input[value="Delete"]').click();
    });
  });
};

describe('Mobile app API: events', () => {
  const branchTitle = `${titlePrefix} branch ${Date.now()}`;
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
      start: dayjs('2030-04-01T10:00:00'),
      end: dayjs('2030-04-01T12:30:00'),
    };

    cy.drupalLogin('/events/add/default');
    fillRequiredEventFields(event, branchId);
    setCustomDate(event.start, event.end);
    // Searching the media library submits the search twice, and the browser
    // aborts the first request. That is harmless, but Drupal reports it.
    Cypress.on(
      'uncaught:exception',
      (error) => !error.message.includes('ReadyState: 0'),
    );
    // The images are in the sidebar, which is collapsed on narrow screens.
    cy.get('.meta-sidebar__trigger').click();
    mediaLibrarySelect(
      '#field_event_image-media-library-wrapper',
      'paige-cody',
      0,
      /^\/events\//,
    );
    mediaLibrarySelect(
      '#field_teaser_image-media-library-wrapper',
      'paige-cody',
      1,
      /^\/events\//,
    );
    cy.get('.meta-sidebar__close').click();
    cy.get('[name="field_event_place[0][value]"]').type('Salen');
    // Events are relevant for ticket managers by default, which is when they
    // have a ticket capacity.
    cy.contains('summary', 'Tickets').click();
    cy.get('[name="field_ticket_capacity[0][value]"]').type('50');
    cy.get('input[value="Add Ticket category"]').click();
    cy.get(
      '[name="field_ticket_categories[0][subform][field_ticket_category_name][0][value]"]',
    ).type('Voksne');
    cy.get(
      '[name="field_ticket_categories[0][subform][field_ticket_category_price][0][value]"]',
    ).type('75');
    cy.contains('summary', 'Partners').click();
    cy.get('[name="field_event_partners[0][value]"]').type('Partneren');
    // We have to use force when using Select2.
    cy.get('select[name="field_categories"]').select('Litteratur', {
      force: true,
    });
    cy.get('select[name="field_audiences[]"]').select('Børn', { force: true });
    cy.get('select[name="field_tags[]"]').select('læsning', { force: true });
    cy.clickSaveButton();
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
      dayjs('2030-05-06T09:00:00'),
      dayjs('2030-05-13T09:00:00'),
      dayjs('2030-05-20T09:00:00'),
    ];
    const weeklyField = (name: string) =>
      cy.get(`[data-drupal-selector="edit-weekly-recurring-date-0-${name}"]`);

    cy.drupalLogin('/events/add/default');
    fillRequiredEventFields({ title, subtitle: 'Undertitel' }, branchId);
    cy.findByLabelText('Recur Type').select('Weekly Event', {
      // We have to use force when using Select2.
      force: true,
    });
    weeklyField('value-date').type(mondays[0].format('YYYY-MM-DD'));
    weeklyField('end-value-date').type(mondays[2].format('YYYY-MM-DD'));
    weeklyField('time').select('09:00 am');
    weeklyField('duration-or-end-time-end-time').check();
    weeklyField('end-time-time').select('11:00 am');
    cy.get('[name="weekly_recurring_date[0][days][monday]"]').check();
    cy.clickSaveButton();
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
      start: dayjs('2030-06-03T10:00:00'),
      end: dayjs('2030-06-03T12:00:00'),
    };
    const updatedTitle = `${titlePrefix} updated ${runId}`;

    createEvent(event, branchId);
    getEventsTitled(event.title).then((events) => {
      expect(events).to.have.length(1);
      expect(events[0].state).to.equal('Active');
    });

    cy.drupalLogin(`/admin/content/eventseries?search=${event.title}`);
    cy.get(`a[aria-label="Edit ${event.title}"]`).click();
    cy.findByLabelText('Title').clear();
    cy.findByLabelText('Title').type(updatedTitle);
    cy.findByLabelText('Subtitle').clear();
    cy.findByLabelText('Subtitle').type('Ny undertitel');
    // We have to use force when using Select2.
    cy.get('select[name="field_event_state"]').select('Cancelled', {
      force: true,
    });
    // Without a ticket manager, the event links to where tickets are sold.
    cy.contains('summary', 'Tickets').click();
    cy.get('[name="field_relevant_ticket_manager[value]"]').uncheck();
    cy.get('[name="field_event_link[0][uri]"]').type(
      'https://example.com/billetter',
    );
    cy.clickSaveButton();
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
    const today = dayjs().startOf('hour');
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
