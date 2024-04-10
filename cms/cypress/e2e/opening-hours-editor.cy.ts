const mainLibraryOpeningHoursPage = "/node/9/edit/opening-hours";
const selectionOption = "Telefontid";

const openMonthView = () => {
  cy.visit(mainLibraryOpeningHoursPage);
  cy.get(".fc-dayGridMonth-button").click();
};

// The datebase is seeded with opning hours but we are not interested in them for our tests
// Therefore we delete all opening hours in the mont view if they exist before we start our tests
const deleteAllOpeningHours = () => {
  openMonthView();
  // Attempt to get the elements, but do not fail the test if they do not exist
  cy.get("body").then(($body) => {
    if (
      $body.find('[data-cy="opening-hours-editor-event-content"]').length > 0
    ) {
      cy.getBySel("opening-hours-editor-event-content").each(($el) => {
        cy.wrap($el).click();
        cy.getBySel("opening-hours-editor-form__remove").click();
      });
    } else {
      cy.log("No opening hours elements found to delete.");
    }
  });
};

const selectTodayFromMonthView = () => {
  return cy.get(".fc-day-today");
};

const createOpeningHour = () => {
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
  beforeEach(() => {
    cy.clearCookies();
    cy.drupalLogin();

    deleteAllOpeningHours();
  });

  it("Checks opening hours categories", () => {
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
  });

  it("Can update an opening hour", () => {
    createOpeningHour();
    updateOpeningHour();
  });

  it("Can delete an opening hour", () => {
    createOpeningHour();
    deleteOpeningHour();
  });
});
