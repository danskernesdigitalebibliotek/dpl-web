// The mobile apps decide whether to offer SMS notifications and which interest
// periods to show for reservations from reservationSettings, which the BFF
// behind them reads. A failure here means a change in the CMS will break the
// mobile apps.
import { ignoreLinkitUriError } from '../../helpers/helper-linkit';
import { gqlQueries } from '../../helpers/mobile-app-queries';

type InterestPeriod = { value: number; label: string };

type ReservationSettings = {
  smsNotificationsEnabled: boolean;
  interestPeriods: { all: InterestPeriod[]; default: InterestPeriod };
  allowRemoveReadyReservations: boolean;
  urls: { pauseReservationInfo: string; zeroHitsSearch: string };
};

const formUrl = '/admin/config/dpl-library-agency/general-settings';
const smsField = '[name="reservation_sms_notifications_enabled"]';
const periodsField = '[name="interest_periods_config"]';
const defaultPeriodField = '[name="default_interest_period_config"]';

const getReservationSettings = () =>
  cy.queryMobileAppGraphql<{ reservationSettings: ReservationSettings }>(
    gqlQueries.GET_RESERVATION_SETTINGS,
  );

const responseWith = (settings: ReservationSettings) => ({
  data: { reservationSettings: settings },
});

const saveForm = () => {
  cy.get('[value="Save configuration"]').first().click();
  cy.contains('The configuration options have been saved.');
};

const setSmsNotifications = (isEnabled: boolean) => {
  cy.drupalLogin(formUrl);
  if (isEnabled) {
    cy.get(smsField).check();
  } else {
    cy.get(smsField).uncheck();
  }
  saveForm();
};

// The default period must be one of the submitted periods, and the select only
// offers periods that have been saved. So the new periods are first saved next
// to the current ones, which keeps the current default valid, and then the new
// default is picked and the old periods are dropped.
const setInterestPeriods = (periods: string, defaultPeriod: string) => {
  cy.drupalLogin(formUrl);
  cy.get(periodsField)
    .invoke('val')
    .then((current) => {
      cy.get(periodsField).invoke(
        'val',
        `${String(current).trim()}\n${periods}`,
      );
    });
  saveForm();
  cy.get(periodsField).invoke('val', periods);
  cy.get(defaultPeriodField).select(defaultPeriod);
  saveForm();
};

ignoreLinkitUriError();

describe('Mobile app API: reservationSettings', () => {
  const original = { sms: true, periods: '', defaultPeriod: '' };

  before(() => {
    cy.drupalLogin(formUrl);
    cy.get(smsField).then(($field) => {
      original.sms = $field.prop('checked');
    });
    cy.get(periodsField)
      .invoke('val')
      .then((value) => {
        original.periods = String(value);
      });
    cy.get(defaultPeriodField)
      .invoke('val')
      .then((value) => {
        original.defaultPeriod = String(value);
      });
  });

  after(() => {
    setSmsNotifications(original.sms);
    setInterestPeriods(original.periods, original.defaultPeriod);
  });

  // The response before the test changes anything. The tests assert on the
  // whole response, so a change must leave the rest of it as it was.
  let unchanged: ReservationSettings;
  beforeEach(() => {
    getReservationSettings().then(({ data }) => {
      // The tests do not edit these fields, but the BFF still reads them.
      const settings = data.reservationSettings;
      expect(settings.allowRemoveReadyReservations).to.be.a('boolean');
      expect(settings.urls.pauseReservationInfo).to.be.a('string');
      expect(settings.urls.zeroHitsSearch).to.be.a('string');
      unchanged = settings;
    });
  });

  it('returns whether SMS notifications are enabled', () => {
    setSmsNotifications(false);
    getReservationSettings().should(
      'deep.equal',
      responseWith({ ...unchanged, smsNotificationsEnabled: false }),
    );

    setSmsNotifications(true);
    getReservationSettings().should(
      'deep.equal',
      responseWith({ ...unchanged, smsNotificationsEnabled: true }),
    );
  });

  it('returns the interest periods and the default an editor sets', () => {
    // Labels unique to the run, so leftovers from an earlier run cannot make
    // the test pass. Labels cannot contain hyphens, as they separate the days
    // from the label.
    const runId = Date.now();
    setInterestPeriods(`7-Uge ${runId}\n30-Måned ${runId}`, '30');

    getReservationSettings().should(
      'deep.equal',
      responseWith({
        ...unchanged,
        interestPeriods: {
          all: [
            { value: 7, label: `Uge ${runId}` },
            { value: 30, label: `Måned ${runId}` },
          ],
          default: { value: 30, label: `Måned ${runId}` },
        },
      }),
    );
  });
});
