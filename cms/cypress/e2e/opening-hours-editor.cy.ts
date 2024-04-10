const selectionOption = "Telefontid";

const createBranchAndVisitOpeningHoursAdmin = () => {
  cy.clearCookies();
  cy.drupalLogin();
  cy.visit("/node/add/branch");
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

const visitOpeningHoursPage = () => {
  const pageUrl = Cypress.env("pageUrl");
  if (pageUrl) {
    cy.visit(pageUrl);
  }
};

const visitOpeningHoursPageAdmin = () => {
  const adminUrl = Cypress.env("adminUrl");
  if (adminUrl) {
    cy.clearCookies();
    cy.drupalLogin();
    cy.visit(adminUrl);
  }
};

const openMonthView = () => {
  cy.get(".fc-dayGridMonth-button").click();
};

const selectTodayFromMonthView = () => {
  return cy.get(".fc-day-today");
};

const createOpeningHour = () => {
  visitOpeningHoursPageAdmin();
  openMonthView();
  selectTodayFromMonthView().click();
  cy.getBySel("opening-hours-editor-form").should("be.visible");
  cy.getBySel("opening-hours-editor-form-select").select(selectionOption);
  cy.getBySel("opening-hours-editor-form-start-time").focus().type("10:00");
  cy.getBySel("opening-hours-editor-form-end-time").focus().type("18:00");
  cy.getBySel("opening-hours-editor-form-submit").click();
  cy.getBySel("opening-hours-editor-event-content")
    .should("be.visible")
    .and("contain", selectionOption)
    .and("contain", "10:00 - 18:00");
};

const updateOpeningHour = () => {
  // Assume that the event is already created and is visible
  cy.getBySel("opening-hours-editor-event-content")
    .contains(selectionOption)
    .click();
  cy.getBySel("opening-hours-editor-form-end-time").clear().type("20:00");
  cy.getBySel("opening-hours-editor-form-submit").click();
  cy.getBySel("opening-hours-editor-event-content")
    .should("be.visible")
    .and("contain", selectionOption)
    .and("contain", "10:00 - 20:00");
};

const deleteOpeningHour = () => {
  // Assume that the event is already created and is visible
  cy.getBySel("opening-hours-editor-event-content")
    .contains(selectionOption)
    .click();
  cy.getBySel("opening-hours-editor-form__remove").click();
};

describe("Opening hours editor", () => {
  before(() => {
    createBranchAndVisitOpeningHoursAdmin();
  });

  it("Checks opening hours categories", () => {
    visitOpeningHoursPageAdmin();
    openMonthView();
    selectTodayFromMonthView().click();
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
    visitOpeningHoursPage();
  });

  it("Can update an opening hour", () => {
    createOpeningHour();
    updateOpeningHour();
    visitOpeningHoursPage();
  });

  it("Can delete an opening hour", () => {
    createOpeningHour();
    deleteOpeningHour();
  });
});
