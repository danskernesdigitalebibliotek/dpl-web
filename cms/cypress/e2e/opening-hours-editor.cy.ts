const selectionOption = "Telefontid";

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

const createOpeningHour = () => {
  visitOpeningHoursPageAdmin();
  navigateToMonthViewAdmin();
  selectTodayFromMonthViewAdmin();
  cy.getBySel("opening-hours-editor-form").should("be.visible");
  cy.getBySel("opening-hours-editor-form-select").select(selectionOption);
  cy.getBySel("opening-hours-editor-form-start-time").focus().type("10:00");
  cy.getBySel("opening-hours-editor-form-end-time").focus().type("18:00");
  cy.getBySel("opening-hours-editor-form-submit").click();
  cy.getBySel("opening-hours-editor-event-content")
    .should("be.visible")
    .and("contain", selectionOption)
    .and("contain", "10:00 - 18:00");
  visitOpeningHoursPage();
  cy.getBySel("opening-hours-week-list").contains(selectionOption);
  cy.getBySel("opening-hours-week-list").contains("10:00 - 18:00");
};

const createOpeningHourInNextWeek = () => {
  visitOpeningHoursPageAdmin();
  navigateToNextWeekAdmin();
  // FullCalendar has a layer over the calendar. Therefore, we need to click the last time-grid slot.
  // The click will be centered and therefore choose the middle of the day (Thursday).
  cy.get('td.fc-timegrid-slot[data-time="08:00:00"]').last().click();
  cy.getBySel("opening-hours-editor-form").should("be.visible");
  cy.getBySel("opening-hours-editor-form-select").select(selectionOption);
  cy.getBySel("opening-hours-editor-form-start-time").should(
    "have.attr",
    "value",
    "08:00"
  );
  cy.getBySel("opening-hours-editor-form-end-time").focus().type("18:00");
  cy.getBySel("opening-hours-editor-form-submit").click();
  visitOpeningHoursPage();
  cy.getBySel("opening-hours-week-list").should("not.contain", selectionOption);
  cy.getBySel("opening-hours-week-list").should("not.contain", "08:00 - 18:00");
  cy.getBySel("opening-hours-next-week-button").click();
  cy.getBySel("opening-hours-week-list").contains(selectionOption);
  cy.getBySel("opening-hours-week-list").contains("08:00 - 18:00");
};

const updateOpeningHour = () => {
  // Assume that the event is already created and is visible
  visitOpeningHoursPageAdmin();
  navigateToMonthViewAdmin();
  cy.getBySel("opening-hours-editor-event-content")
    .contains(selectionOption)
    .click();
  cy.getBySel("opening-hours-editor-form-end-time").clear().type("20:00");
  cy.getBySel("opening-hours-editor-form-submit").click();
  cy.getBySel("opening-hours-editor-event-content")
    .should("be.visible")
    .and("contain", selectionOption)
    .and("contain", "10:00 - 20:00");
  visitOpeningHoursPage();
  cy.getBySel("opening-hours-week-list").contains(selectionOption);
  cy.getBySel("opening-hours-week-list").contains("10:00 - 20:00");
};

const deleteOpeningHour = () => {
  // Assume that the event is already created and is visible
  visitOpeningHoursPageAdmin();
  navigateToMonthViewAdmin();
  cy.getBySel("opening-hours-editor-event-content")
    .contains(selectionOption)
    .click();
  cy.getBySel("opening-hours-editor-form__remove").click();
  visitOpeningHoursPage();
  cy.getBySel("opening-hours-week-list").should("not.contain", selectionOption);
  cy.getBySel("opening-hours-week-list").should("not.contain", "10:00 - 18:00");
  cy.getBySel("opening-hours-week-list").contains(
    "The library is closed this day"
  );
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
      .and("contain", "Åbent")
      .and("contain", "Borgerservice")
      .and("contain", "Med betjening")
      .and("contain", "Selvbetjening")
      .and("contain", "Telefontid");
  });

  it("Can create an opening hour", () => {
    createOpeningHour();
  });

  it("Can update an opening hour", () => {
    createOpeningHour();
    updateOpeningHour();
  });

  it("Can delete an opening hour", () => {
    createOpeningHour();
    deleteOpeningHour();
  });

  it("Can create opening hour in next week", () => {
    createOpeningHourInNextWeek();
  });
});
