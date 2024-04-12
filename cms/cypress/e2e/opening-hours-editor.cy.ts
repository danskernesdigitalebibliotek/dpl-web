enum OpeningHourCategories {
  Opening = "Åbent",
  CitizenService = "Borgerservice",
  WithService = "Med betjening",
  SelfService = "Selvbetjening",
  PhoneTime = "Telefontid",
}

type OpeningHourFormType = {
  openingHourCategory: OpeningHourCategories;
  start: `${number}:${number}`;
  end: `${number}:${number}`;
};

const createBranchAndVisitOpeningHoursAdmin = () => {
  cy.drupalLoginAndVisit("/node/add/branch");
  cy.get("#edit-title-0-value").type("Test branch");
  cy.get('button[title="Show all Paragraphs"]').click();
  cy.get('button[value="Opening Hours"]').click({
    multiple: true,
    force: true,
  });
  cy.get("#edit-field-address-0-address-address-line1")
    .type("Example Street", { force: true })
    .should("have.value", "Example Street");
  cy.get("#edit-field-address-0-address-postal-code")
    .type("1234", { force: true })
    .should("have.value", "1234");
  cy.get("#edit-field-address-0-address-locality")
    .type("Example City", { force: true })
    .should("have.value", "Example City");
  cy.get('input[value="Save"]').click();
  cy.get('a[href^="/node/"][href$="/edit"]').click({ force: true });
  cy.get('a[href*="/edit/opening-hours"]').click();
  // Save the URL for the admin page and the page itself for later use
  cy.url().then((url) => {
    Cypress.env("adminUrl", url);
    const pageUrl = url.replace("/edit/opening-hours", "");
    Cypress.env("pageUrl", pageUrl);
  });
};

const deleteBranch = () => {
  const pageUrl = Cypress.env("pageUrl");
  if (pageUrl) {
    cy.visit(`${pageUrl}/delete`);
    cy.get('input[value="Delete"]').click();
  }
};

const visitOpeningHoursPage = () => {
  const pageUrl = Cypress.env("pageUrl");
  if (pageUrl) {
    cy.visit(pageUrl);
  }
};

const visitOpeningHoursPageAdmin = () => {
  const adminUrl = Cypress.env("adminUrl");
  if (adminUrl) {
    cy.drupalLoginAndVisit(adminUrl);
  }
};

const navigateToNextWeekAdmin = () => {
  cy.get('button[title="Næste"]').click();
};

const navigateToMonthViewAdmin = () => {
  cy.get(".fc-dayGridMonth-button").click();
};

const selectTodayFromMonthViewAdmin = () => {
  cy.get(".fc-day-today").click();
};

const selectTimeOnThursdayFromWeekView = ({
  start,
}: Pick<OpeningHourFormType, "start">): void => {
  // In FullCalendar, the date and time elements are siblings in the same overlaying div, which prevents selection by both date and time simultaneously.
  // To work around this, we target a specific time slot. This example selects the 08:00 slot, which spans all days.
  // Since Cypress clicks at the center of the target element by default, and our time slots extend across all weekdays, it will interact with the slot for Thursday.
  cy.get(`td.fc-timegrid-slot-lane[data-time="${start}:00"]`).click();
};

const fillOpeningHourForm = ({
  openingHourCategory,
  start,
  end,
}: Partial<OpeningHourFormType>) => {
  cy.getBySel("opening-hours-editor-form").should("be.visible");

  if (openingHourCategory) {
    cy.getBySel("opening-hours-editor-form-select").select(openingHourCategory);
  }
  if (start) {
    cy.getBySel("opening-hours-editor-form-start-time").focus().type(start);
  }
  if (end) {
    cy.getBySel("opening-hours-editor-form-end-time").focus().type(end);
  }
};

const submitOpeningHourForm = () => {
  cy.getBySel("opening-hours-editor-form-submit").click();
};

const checkOpeningHoursAdmin = ({
  openingHourCategory,
  start,
  end,
}: OpeningHourFormType) => {
  return cy
    .getBySel("opening-hours-editor-event-content")
    .should("be.visible")
    .and("contain", openingHourCategory)
    .and("contain", `${start} - ${end}`);
};

const checkOpeningHoursPage = ({
  openingHourCategory,
  start,
  end,
}: OpeningHourFormType) => {
  cy.getBySel("opening-hours-week-list")
    .should("be.visible")
    .and("contain", openingHourCategory)
    .and("contain", `${start} - ${end}`);
};

const checkOpeningHoursNotPresentInPage = ({
  openingHourCategory,
  start,
  end,
}: OpeningHourFormType) => {
  cy.getBySel("opening-hours-week-list")
    .should("be.visible")
    .should("not.contain", openingHourCategory)
    .should("not.contain", `${start} - ${end}`)
    .contains("The library is closed this day");
};

const createOpeningHour = ({
  openingHourCategory,
  start,
  end,
}: OpeningHourFormType) => {
  visitOpeningHoursPageAdmin();
  navigateToMonthViewAdmin();
  selectTodayFromMonthViewAdmin();
  fillOpeningHourForm({ openingHourCategory, start, end });
  submitOpeningHourForm();
  checkOpeningHoursAdmin({ openingHourCategory, start, end });
  visitOpeningHoursPage();
  checkOpeningHoursPage({ openingHourCategory, start, end });
};

const createOpeningHourInNextWeek = ({
  openingHourCategory,
  start,
  end,
}: OpeningHourFormType) => {
  visitOpeningHoursPageAdmin();
  navigateToNextWeekAdmin();
  selectTimeOnThursdayFromWeekView({ start });
  fillOpeningHourForm({ openingHourCategory, end });
  cy.getBySel("opening-hours-editor-form-start-time").should(
    "have.attr",
    "value",
    start
  );
  submitOpeningHourForm();
  visitOpeningHoursPage();
  checkOpeningHoursNotPresentInPage({
    openingHourCategory,
    start,
    end,
  });
  cy.getBySel("opening-hours-next-week-button").click();
  checkOpeningHoursPage({ openingHourCategory, start, end });
};

const updateOpeningHour = ({
  openingHourCategory,
  start,
  end,
}: OpeningHourFormType) => {
  // Assume that the event is already created and is visible
  visitOpeningHoursPageAdmin();
  navigateToMonthViewAdmin();
  cy.getBySel("opening-hours-editor-event-content")
    .contains(openingHourCategory)
    .click();
  fillOpeningHourForm({ start, end });
  submitOpeningHourForm();
  checkOpeningHoursAdmin({ openingHourCategory, start, end });
  visitOpeningHoursPage();
  checkOpeningHoursPage({ openingHourCategory, start, end });
};

const deleteOpeningHour = ({
  openingHourCategory,
  start,
  end,
}: OpeningHourFormType) => {
  createOpeningHour({
    openingHourCategory,
    start,
    end,
  });
  visitOpeningHoursPageAdmin();
  navigateToMonthViewAdmin();
  checkOpeningHoursAdmin({
    openingHourCategory,
    start,
    end,
  }).click();

  cy.getBySel("opening-hours-editor-form__remove").click();
  visitOpeningHoursPage();
  checkOpeningHoursNotPresentInPage({
    openingHourCategory,
    start,
    end,
  });
};

describe("Opening hours editor", () => {
  beforeEach(() => {
    createBranchAndVisitOpeningHoursAdmin();
  });

  afterEach(() => {
    deleteBranch();
  });

  it("Checks opening hours categories", () => {
    visitOpeningHoursPageAdmin();
    navigateToMonthViewAdmin();
    selectTodayFromMonthViewAdmin();
    cy.getBySel("opening-hours-editor-form-select")
      .find("option")
      .should("have.length", 5)
      .and("contain", OpeningHourCategories.Opening)
      .and("contain", OpeningHourCategories.CitizenService)
      .and("contain", OpeningHourCategories.WithService)
      .and("contain", OpeningHourCategories.SelfService)
      .and("contain", OpeningHourCategories.PhoneTime);
  });

  it("Can create an opening hour", () => {
    createOpeningHour({
      openingHourCategory: OpeningHourCategories.Opening,
      start: "08:00",
      end: "16:00",
    });
  });

  it("Can update an opening hour", () => {
    createOpeningHour({
      openingHourCategory: OpeningHourCategories.PhoneTime,
      start: "10:00",
      end: "11:00",
    });
    updateOpeningHour({
      openingHourCategory: OpeningHourCategories.PhoneTime,
      start: "10:00",
      end: "15:00",
    });
  });

  it("Can delete an opening hour", () => {
    deleteOpeningHour({
      openingHourCategory: OpeningHourCategories.WithService,
      start: "10:00",
      end: "11:00",
    });
  });

  it("Can create opening hour in next week", () => {
    createOpeningHourInNextWeek({
      openingHourCategory: OpeningHourCategories.CitizenService,
      start: "10:00",
      end: "11:00",
    });
  });
});
