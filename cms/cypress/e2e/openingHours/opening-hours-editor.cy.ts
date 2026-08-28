const branchTitle = 'Test branch';
const firstDateOfJanuary2024 = '2024-01-01';

enum OpeningHourCategories {
  Opening = 'Åbent',
  CitizenService = 'Borgerservice',
  WithService = 'Med betjening',
  SelfService = 'Selvbetjening',
  PhoneTime = 'Telefontid',
}

type TimeString = `${number}:${number}`;

type TimeDurationType = {
  start: TimeString;
  end: TimeString;
};

type PartialTimeDurationType = {
  start?: TimeString;
  end?: TimeString;
};

type OpeningHourFormType = {
  openingHourCategory: OpeningHourCategories;
  timeDuration: TimeDurationType;
  endDate?: string;
};

type PartialOpeningHourFormType = Omit<OpeningHourFormType, 'timeDuration'> & {
  timeDuration?: PartialTimeDurationType;
};

const reverseDateString = (date: string) => date.split('-').reverse().join('-');

const createTestBranchAndVisitOpeningHoursAdmin = () => {
  cy.drupalLogin('/node/add/branch');
  cy.get('#edit-title-0-value').type(branchTitle);
  // Add the paragraph through the base form's (hidden) add button instead of
  // the paragraphs modal, to avoid racing the modal's AJAX request.
  cy.get('button[name="field_paragraphs_opening_hours_add_more"]').click({
    force: true,
  });
  // The paragraph is added through AJAX; wait for its subform so the node is
  // not saved without it.
  cy.get('.paragraphs-subform').should('exist');
  cy.clickSaveButton();
  cy.get('a[href^="/node/"][href$="/edit"]').click({ force: true });
  cy.get('a[href*="/edit/opening-hours"]').click();
  // Save the URL for the admin page and the page itself for later use
  cy.url().then((url) => {
    Cypress.env('adminUrl', url);
    const pageUrl = url.replace('/edit/opening-hours', '');
    Cypress.env('pageUrl', pageUrl);
  });
};

const visitOpeningHoursPage = (initialDate?: string) => {
  const pageUrl = Cypress.env('pageUrl');
  if (pageUrl) {
    const url = initialDate ? `${pageUrl}?initialDate=${initialDate}` : pageUrl;
    cy.visit(url);
  }
};

const visitOpeningHoursAdmin = (initialDate?: string) => {
  const adminUrl = Cypress.env('adminUrl');
  if (adminUrl) {
    const url = initialDate
      ? `${adminUrl}?initialDate=${initialDate}`
      : adminUrl;
    cy.drupalLogin(url);
  }
};

const navigateToNextWeekOrMonthAdmin = () => {
  cy.get('.js-opening-hours-editor-button-next').click();
};

const navigateToMonthViewAdmin = () => {
  cy.get('.js-opening-hours-editor-button-dayGridMonth').click();
};

const selectTodayFromMonthViewAdmin = () => {
  cy.get('.js-opening-hours-editor-day-cell-today').click();
};

const firstDateOfFebruary2024 = '2024-02-01';

const clickFirstDayInMonthViewAdmin = () => {
  cy.get('[data-date$="-01"]').first().click();
};

const selectTimeOnThursdayFromWeekView = (start: TimeString): void => {
  // FullCalendar renders each weekday as one 24-hour lane without per-slot
  // elements, so we click the Thursday lane (weeks start on Monday) at the
  // vertical offset of the start time. Aiming 15 minutes past the start
  // keeps the click inside the half-hour slot beginning at the start time.
  const [hours, minutes] = start.split(':').map(Number);
  cy.get('.js-opening-hours-editor-day-lane')
    .eq(3)
    .then(($lane) => {
      const laneWidth = $lane.width() ?? 0;
      const laneHeight = $lane.height() ?? 0;
      const clickPositionY = (laneHeight * (hours + (minutes + 15) / 60)) / 24;
      // FullCalendar ignores clicks on coordinates outside the visible
      // viewport, and a forced click skips Cypress' own scrolling, so we
      // scroll the click position into view ourselves.
      cy.wrap($lane).scrollIntoView({
        offset: {
          top: clickPositionY - Cypress.config('viewportHeight') / 2,
          left: 0,
        },
      });
      // The lane is covered by the horizontal slot lines, so the click must
      // be forced. FullCalendar resolves the slot from the coordinates.
      cy.wrap($lane).click(laneWidth / 2, clickPositionY, { force: true });
    });
};

const fillOpeningHourForm = ({
  openingHourCategory,
  timeDuration: { start, end },
  endDate,
}: Partial<PartialOpeningHourFormType>) => {
  cy.getBySel('opening-hours-editor-form').should('be.visible');

  if (openingHourCategory) {
    cy.getBySel('opening-hours-editor-form-select').select(openingHourCategory);
  }
  if (start) {
    cy.getBySel('opening-hours-editor-form-start-time').focus();
    cy.getBySel('opening-hours-editor-form-start-time').type(start);
  }
  if (end) {
    cy.getBySel('opening-hours-editor-form-end-time').focus();
    cy.getBySel('opening-hours-editor-form-end-time').type(end);
  }
  if (endDate) {
    cy.getBySel('opening-hours-editor-form-repeated').check();
    cy.getBySel('opening-hours-editor-form-end-date').focus();
    cy.getBySel('opening-hours-editor-form-end-date').type(endDate);
  }
};

const submitOpeningHourForm = () => {
  cy.getBySel('opening-hours-editor-form-submit').click();
};

const checkConfirmationDialog = ({
  openingHourCategory,
  timeDuration: { start, end },
  endDate,
}: Required<OpeningHourFormType>) => {
  cy.getBySel('opening-hours-editor-confirm-add-repeated-form')
    .should('be.visible')
    .and('contain', openingHourCategory)
    .and('contain', start)
    .and('contain', end)
    .and('contain', reverseDateString(endDate));
};

const confirmAddRepeatedOpeningHourForm = () => {
  cy.getBySel('opening-hours-editor-form__confirm').click();
};

const validateOpeningHoursPage = ({
  openingHourCategory,
  timeDuration: { start, end },
}: OpeningHourFormType) => {
  cy.getBySel('opening-hours-week-list').scrollIntoView();
  cy.getBySel('opening-hours-week-list')
    .should('be.visible')
    .and('contain', openingHourCategory)
    .and('contain', `${start} - ${end}`);
};

const validateNumberOfOpeningHoursExistAdmin = ({
  expectedOpeningHours,
  openingHourCategory,
  timeDuration: { start, end },
}: OpeningHourFormType & { expectedOpeningHours: number }) => {
  return cy
    .getBySel('opening-hours-editor')
    .should('be.visible')
    .find('div[data-cy="opening-hours-editor-event-content"]')
    .filter((index, element) => {
      const openingHour = Cypress.$(element).text();
      return (
        openingHour.includes(openingHourCategory) &&
        openingHour.includes(`${start} - ${end}`)
      );
    })
    .should('have.length', expectedOpeningHours);
};

const validateOpeningHoursRemovedAdmin = ({
  openingHourCategory,
  timeDuration: { start, end },
  editSeriesFromIndex,
}) => {
  return cy
    .getBySel('opening-hours-editor')
    .should('be.visible')
    .find('div[data-cy="opening-hours-editor-event-content"]')
    .should('have.length', editSeriesFromIndex)
    .each((element) => {
      cy.wrap(element)
        .should('contain', openingHourCategory)
        .and('contain', `${start} - ${end}`);
    });
};

const validateOpeningHoursNotPresentPage = ({
  openingHourCategory,
  timeDuration: { start, end },
}: OpeningHourFormType) => {
  cy.getBySel('opening-hours-week-list')
    .should('be.visible')
    .should('not.contain', openingHourCategory)
    .should('not.contain', `${start} - ${end}`)
    .contains('The library is closed this day');
};

const validateOpeningHoursNotPresentAdmin = ({
  openingHourCategory,
  timeDuration: { start, end },
}: OpeningHourFormType) => {
  cy.getBySel('opening-hours-editor')
    .should('be.visible')
    .should('not.contain', openingHourCategory)
    .should('not.contain', `${start} - ${end}`);
};

const confirmEditRepeatedOpeningHourForm = (value?: 'all') => {
  const selector =
    value === 'all'
      ? 'opening-hours-editor-form__radio-all'
      : 'opening-hours-editor-form__radio-this';
  cy.getBySel(selector).click();

  confirmAddRepeatedOpeningHourForm();
};

const createOpeningHour = ({
  openingHourCategory,
  timeDuration: { start, end },
}: OpeningHourFormType) => {
  visitOpeningHoursAdmin();
  navigateToMonthViewAdmin();
  selectTodayFromMonthViewAdmin();
  fillOpeningHourForm({ openingHourCategory, timeDuration: { start, end } });
  submitOpeningHourForm();
  validateNumberOfOpeningHoursExistAdmin({
    expectedOpeningHours: 1,
    openingHourCategory,
    timeDuration: { start, end },
  });
  visitOpeningHoursPage();
  validateOpeningHoursPage({
    openingHourCategory,
    timeDuration: { start, end },
  });
};

const createOpeningHourInNextWeek = ({
  openingHourCategory,
  timeDuration: { start, end },
}: OpeningHourFormType) => {
  visitOpeningHoursAdmin();
  navigateToNextWeekOrMonthAdmin();
  selectTimeOnThursdayFromWeekView(start);
  fillOpeningHourForm({ openingHourCategory, timeDuration: { end } });
  cy.getBySel('opening-hours-editor-form-start-time').should(
    'have.attr',
    'value',
    start,
  );
  submitOpeningHourForm();
  visitOpeningHoursPage();
  validateOpeningHoursNotPresentPage({
    openingHourCategory,
    timeDuration: { start, end },
  });
  cy.getBySel('opening-hours-next-week-button').click();
  validateOpeningHoursPage({
    openingHourCategory,
    timeDuration: { start, end },
  });
};

const createOpeningHoursSeries = ({
  openingHourCategory,
  timeDuration: { start, end },
  endDate,
}: Required<OpeningHourFormType>) => {
  visitOpeningHoursAdmin(firstDateOfJanuary2024);
  navigateToMonthViewAdmin();
  clickFirstDayInMonthViewAdmin();
  fillOpeningHourForm({
    openingHourCategory,
    timeDuration: { start, end },
    endDate,
  });
  submitOpeningHourForm();
  checkConfirmationDialog({
    openingHourCategory,
    timeDuration: { start, end },
    endDate,
  });
  confirmAddRepeatedOpeningHourForm();
  validateNumberOfOpeningHoursExistAdmin({
    expectedOpeningHours: 5,
    openingHourCategory,
    timeDuration: { start, end },
  });
  navigateToNextWeekOrMonthAdmin();
  validateNumberOfOpeningHoursExistAdmin({
    expectedOpeningHours: 1,
    openingHourCategory,
    timeDuration: { start, end },
  });
  visitOpeningHoursPage();
  visitOpeningHoursPage(firstDateOfJanuary2024);
  // Because we use firstDateOfFebruary2024 as endDate we can check the four next weeks
  for (let i = 0; i < 5; i++) {
    validateOpeningHoursPage({
      openingHourCategory,
      timeDuration: { start, end },
    });
    cy.getBySel('opening-hours-next-week-button').click();
  }
};

const updateOpeningHour = ({
  openingHourCategory,
  timeDuration: { start, end },
}: OpeningHourFormType) => {
  // Assume that the event is already created and is visible
  visitOpeningHoursAdmin();
  navigateToMonthViewAdmin();
  cy.getBySel('opening-hours-editor-event-content')
    .contains(openingHourCategory)
    .click();
  fillOpeningHourForm({ timeDuration: { start, end } });
  submitOpeningHourForm();
  validateNumberOfOpeningHoursExistAdmin({
    expectedOpeningHours: 1,
    openingHourCategory,
    timeDuration: { start, end },
  });
  visitOpeningHoursPage();
  validateOpeningHoursPage({
    openingHourCategory,
    timeDuration: { start, end },
  });
};

const updateOpeningHoursSeries = ({
  openingHourCategory,
  timeDuration: { start, end },
  editSeriesFromIndex = 0,
}: OpeningHourFormType & { editSeriesFromIndex?: number }) => {
  // Assume that the event is already created and is visible
  visitOpeningHoursAdmin(firstDateOfJanuary2024);
  navigateToMonthViewAdmin();
  cy.getBySel('opening-hours-editor-event-content')
    .eq(editSeriesFromIndex)
    .contains(openingHourCategory)
    .click();
  fillOpeningHourForm({ timeDuration: { start, end } });
  submitOpeningHourForm();
  confirmEditRepeatedOpeningHourForm('all');
  visitOpeningHoursAdmin(firstDateOfJanuary2024);
  navigateToMonthViewAdmin();
};

const deleteOpeningHour = ({
  openingHourCategory,
  timeDuration: { start, end },
}: OpeningHourFormType) => {
  visitOpeningHoursAdmin();
  navigateToMonthViewAdmin();
  validateNumberOfOpeningHoursExistAdmin({
    expectedOpeningHours: 1,
    openingHourCategory,
    timeDuration: { start, end },
  }).click();
  cy.getBySel('opening-hours-editor-form__remove').click();
  validateOpeningHoursNotPresentAdmin({
    openingHourCategory,
    timeDuration: { start, end },
  });
  visitOpeningHoursPage();
  validateOpeningHoursNotPresentPage({
    openingHourCategory,
    timeDuration: { start, end },
  });
};

const deleteOpeningHoursSeries = ({
  openingHourCategory,
  timeDuration: { start, end },
}: OpeningHourFormType) => {
  visitOpeningHoursAdmin(firstDateOfJanuary2024);
  navigateToMonthViewAdmin();
  validateNumberOfOpeningHoursExistAdmin({
    expectedOpeningHours: 5,
    openingHourCategory,
    timeDuration: { start, end },
  })
    .first()
    .click();
  cy.getBySel('opening-hours-editor-form__remove').click();
  confirmEditRepeatedOpeningHourForm('all');
  visitOpeningHoursAdmin(firstDateOfJanuary2024);
  navigateToMonthViewAdmin();
  validateOpeningHoursNotPresentAdmin({
    openingHourCategory,
    timeDuration: { start, end },
  });
  visitOpeningHoursPage();
  visitOpeningHoursPage(firstDateOfJanuary2024);
  // Because we use firstDateOfFebruary2024 as endDate we can check the four next weeks
  for (let i = 0; i < 5; i++) {
    validateOpeningHoursNotPresentPage({
      openingHourCategory,
      timeDuration: { start, end },
    });
    cy.getBySel('opening-hours-next-week-button').click();
  }
};

const deleteRestOfOpeningHoursSeries = ({
  openingHourCategory,
  timeDuration: { start, end },
  editSeriesFromIndex = 0,
}: OpeningHourFormType & { editSeriesFromIndex?: number }) => {
  visitOpeningHoursAdmin(firstDateOfJanuary2024);
  navigateToMonthViewAdmin();
  validateNumberOfOpeningHoursExistAdmin({
    expectedOpeningHours: 5,
    openingHourCategory,
    timeDuration: { start, end },
  })
    .eq(editSeriesFromIndex)
    .click();
  cy.getBySel('opening-hours-editor-form__remove').click();
  confirmEditRepeatedOpeningHourForm('all');
};

describe('Opening hours editor', () => {
  beforeEach(() => {
    cy.deleteEntitiesIfExists(branchTitle);
    createTestBranchAndVisitOpeningHoursAdmin();
  });

  it('Checks opening hours categories', () => {
    visitOpeningHoursAdmin();
    navigateToMonthViewAdmin();
    selectTodayFromMonthViewAdmin();
    cy.getBySel('opening-hours-editor-form-select')
      .find('option')
      .should('have.length', 5)
      .and('contain', OpeningHourCategories.Opening)
      .and('contain', OpeningHourCategories.CitizenService)
      .and('contain', OpeningHourCategories.WithService)
      .and('contain', OpeningHourCategories.SelfService)
      .and('contain', OpeningHourCategories.PhoneTime);
  });

  it('Can create an opening hour', () => {
    createOpeningHour({
      openingHourCategory: OpeningHourCategories.Opening,
      timeDuration: { start: '08:00', end: '16:00' },
    });
  });

  it('Can update an opening hour', () => {
    createOpeningHour({
      openingHourCategory: OpeningHourCategories.PhoneTime,
      timeDuration: { start: '10:00', end: '11:00' },
    });
    updateOpeningHour({
      openingHourCategory: OpeningHourCategories.PhoneTime,
      timeDuration: { start: '10:00', end: '15:00' },
    });
  });

  it('Can delete an opening hour', () => {
    const openingHour: OpeningHourFormType = {
      openingHourCategory: OpeningHourCategories.WithService,
      timeDuration: { start: '10:00', end: '11:00' },
    };
    createOpeningHour(openingHour);
    deleteOpeningHour(openingHour);
  });

  it('Can create opening hour in next week', () => {
    createOpeningHourInNextWeek({
      openingHourCategory: OpeningHourCategories.CitizenService,
      timeDuration: { start: '10:00', end: '11:00' },
    });
  });

  it('Can create opening hours series', () => {
    createOpeningHoursSeries({
      openingHourCategory: OpeningHourCategories.SelfService,
      timeDuration: { start: '10:00', end: '16:00' },
      endDate: firstDateOfFebruary2024,
    });
  });

  it('Can edit all opening hours series', () => {
    createOpeningHoursSeries({
      openingHourCategory: OpeningHourCategories.SelfService,
      timeDuration: { start: '10:00', end: '16:00' },
      endDate: firstDateOfFebruary2024,
    });
    updateOpeningHoursSeries({
      openingHourCategory: OpeningHourCategories.SelfService,
      timeDuration: { start: '09:00', end: '15:00' },
    });
    validateNumberOfOpeningHoursExistAdmin({
      expectedOpeningHours: 5,
      openingHourCategory: OpeningHourCategories.SelfService,
      timeDuration: { start: '09:00', end: '15:00' },
    });
    visitOpeningHoursPage(firstDateOfJanuary2024);
    // Because we use firstDateOfFebruary2024 as endDate we can check the four next weeks
    for (let i = 0; i < 5; i++) {
      validateOpeningHoursPage({
        openingHourCategory: OpeningHourCategories.SelfService,
        timeDuration: { start: '09:00', end: '15:00' },
      });
      cy.getBySel('opening-hours-next-week-button').click();
    }
  });

  type EditRestOfOpeningHoursSeriesType = {
    editSeriesFromIndex: number;
    openingHourCategory: OpeningHourCategories;
    originalTimeDuration: TimeDurationType;
    updatedTimeDuration: TimeDurationType;
  };

  it('Can edit rest of opening hours series', () => {
    const editData: EditRestOfOpeningHoursSeriesType = {
      editSeriesFromIndex: 1,
      openingHourCategory: OpeningHourCategories.SelfService,
      originalTimeDuration: { start: '10:00', end: '16:00' },
      updatedTimeDuration: { start: '09:00', end: '15:00' },
    };

    createOpeningHoursSeries({
      openingHourCategory: editData.openingHourCategory,
      timeDuration: editData.originalTimeDuration,
      endDate: firstDateOfFebruary2024,
    });

    updateOpeningHoursSeries({
      editSeriesFromIndex: editData.editSeriesFromIndex,
      openingHourCategory: editData.openingHourCategory,
      timeDuration: editData.updatedTimeDuration,
    });

    visitOpeningHoursAdmin(firstDateOfJanuary2024);
    navigateToMonthViewAdmin();
    // Validate that the first series has not been updated
    validateNumberOfOpeningHoursExistAdmin({
      expectedOpeningHours: 1,
      openingHourCategory: editData.openingHourCategory,
      timeDuration: editData.originalTimeDuration,
    });
    // Validate that the rest of the series has been updated
    validateNumberOfOpeningHoursExistAdmin({
      expectedOpeningHours: 4,
      openingHourCategory: editData.openingHourCategory,
      timeDuration: editData.updatedTimeDuration,
    });
  });

  it('Can delete all opening hours series', () => {
    const openingHour: Required<OpeningHourFormType> = {
      openingHourCategory: OpeningHourCategories.WithService,
      timeDuration: { start: '10:00', end: '11:00' },
      endDate: firstDateOfFebruary2024,
    };
    createOpeningHoursSeries(openingHour);
    deleteOpeningHoursSeries(openingHour);
  });

  it('Can delete rest of opening hours series', () => {
    const editData: Required<OpeningHourFormType> & {
      editSeriesFromIndex: number;
    } = {
      openingHourCategory: OpeningHourCategories.WithService,
      timeDuration: { start: '10:00', end: '11:00' },
      endDate: firstDateOfFebruary2024,
      editSeriesFromIndex: 1,
    };

    createOpeningHoursSeries({
      openingHourCategory: editData.openingHourCategory,
      timeDuration: editData.timeDuration,
      endDate: editData.endDate,
    });

    deleteRestOfOpeningHoursSeries({
      editSeriesFromIndex: editData.editSeriesFromIndex,
      openingHourCategory: editData.openingHourCategory,
      timeDuration: editData.timeDuration,
      endDate: editData.endDate,
    });

    visitOpeningHoursAdmin(firstDateOfJanuary2024);
    navigateToMonthViewAdmin();
    validateOpeningHoursRemovedAdmin({
      editSeriesFromIndex: editData.editSeriesFromIndex,
      openingHourCategory: editData.openingHourCategory,
      timeDuration: editData.timeDuration,
    });
  });
});
