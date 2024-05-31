const branchTitle = "Test branch";

enum OpeningHourCategories {
  Opening = "Åbent",
  CitizenService = "Borgerservice",
  WithService = "Med betjening",
  SelfService = "Selvbetjening",
  PhoneTime = "Telefontid",
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

type PartialOpeningHourFormType = Omit<OpeningHourFormType, "timeDuration"> & {
  timeDuration?: PartialTimeDurationType;
};

const reverseDateString = (date: string) => date.split("-").reverse().join("-");

const createTestBranchAndVisitOpeningHoursAdmin = () => {
  cy.drupalLogin("/node/add/branch");
  cy.get("#edit-title-0-value").type(branchTitle);
  cy.get('button[title="Show all Paragraphs"]').click();
  // Forcing and multiple was the only way i cud get this to work
  cy.get('button[value="Opening Hours"]').click({
    multiple: true,
    force: true,
  });
  // Forcing is necessary because the feilds are hidden by an shown in at "popup"
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
const deleteAllTestBranchesIfExists = () => {
  const formattedSearchString = branchTitle.toLowerCase().replace(/ /g, "+");
  cy.drupalLogin();
  cy.visit(
    `/admin/content?title=${formattedSearchString}&type=branch&status=All&langcode=All`
  );

  cy.get("tbody").then((tbody) => {
    if (tbody.find("td.views-empty").length) {
      cy.log("No branches to delete.");
    } else {
      cy.get('input[title="Select all rows in this table"]').check({
        force: true,
      });
      cy.get("#edit-action").select("node_delete_action");
      cy.contains("input", "Apply to selected items").click();
      cy.contains("input", "Delete").click();
    }
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
    cy.drupalLogin(adminUrl);
  }
};

const navigateToNextWeekOrMonthAdmin = () => {
  cy.get('button[title="Næste"]').click();
};

const navigateToMonthViewAdmin = () => {
  cy.get(".fc-dayGridMonth-button").click();
};

const selectTodayFromMonthViewAdmin = () => {
  cy.get(".fc-day-today").click();
};

const navigateToFirstJanuary2024 = (
  type: "monthViewAdmin" | "weekViewPage"
) => {
  if (type === "monthViewAdmin") {
    checkAndNavigate({
      selector: '[data-date="2024-01-01"]',
      navigateAction: () => cy.get('button[title="Forrige"]').click(),
    });
  } else if (type === "weekViewPage") {
    checkAndNavigate({
      selector: '[data-cy="2024-01-01"]',
      navigateAction: () =>
        cy.getBySel("opening-hours-previous-week-button").click(),
    });
  }
};

const checkAndNavigate = ({ selector, navigateAction }) => {
  cy.get("body").then(($body) => {
    if ($body.find(selector).length) {
      cy.log(`Found element with selector attribute '${selector}'`);
    } else {
      cy.intercept({
        method: "GET",
        url: "/api/v1/opening_hours?*",
      }).as("openinghours");
      navigateAction();
      cy.wait("@openinghours");
      // Wait for the react component to update
      // eslint-disable-next-line
      cy.wait(500);
      checkAndNavigate({ selector, navigateAction });
    }
  });
};

const firstDateOfFebruary2024 = "2024-02-01";

const clickFirstDayInMonthViewAdmin = () => {
  cy.get('[data-date$="-01"]').first().click();
};

const selectTimeOnThursdayFromWeekView = (start: string): void => {
  // In FullCalendar, the date and time elements are siblings in the same overlaying div, which prevents selection by both date and time simultaneously.
  // To work around this, we target a specific time slot. This example selects the a time slot, which spans all days.
  // Since Cypress clicks at the center of the target element by default, and our time slots extend across all weekdays, it will interact with the slot for Thursday.
  cy.get(`td.fc-timegrid-slot-lane[data-time="${start}:00"]`).click();
};

const fillOpeningHourForm = ({
  openingHourCategory,
  timeDuration: { start, end },
  endDate,
}: Partial<PartialOpeningHourFormType>) => {
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
  if (endDate) {
    cy.getBySel("opening-hours-editor-form-repeated").check();
    cy.getBySel("opening-hours-editor-form-end-date").focus().type(endDate);
  }
};

const submitOpeningHourForm = () => {
  cy.getBySel("opening-hours-editor-form-submit").click();
};

const checkConfirmationDialog = ({
  openingHourCategory,
  timeDuration: { start, end },
  endDate,
}: Required<OpeningHourFormType>) => {
  cy.getBySel("opening-hours-editor-confirm-add-repeated-form")
    .should("be.visible")
    .and("contain", openingHourCategory)
    .and("contain", start)
    .and("contain", end)
    .and("contain", reverseDateString(endDate));
};

const confirmAddRepeatedOpeningHourForm = () => {
  cy.getBySel("opening-hours-editor-form__confirm").click();
};

const validateOpeningHoursPage = ({
  openingHourCategory,
  timeDuration: { start, end },
}: OpeningHourFormType) => {
  cy.getBySel("opening-hours-week-list")
    .should("be.visible")
    .and("contain", openingHourCategory)
    .and("contain", `${start} - ${end}`);
};

const validateAtLeastOneOpeningHoursExistAdmin = ({
  openingHourCategory,
  timeDuration: { start, end },
}: OpeningHourFormType) => {
  return cy
    .get('tbody[role="presentation"]')
    .should("be.visible")
    .find('div[data-cy="opening-hours-editor-event-content"]')
    .should("have.length.gte", 1)
    .should("contain", openingHourCategory)
    .and("contain", `${start} - ${end}`);
};

const validateOpeningHoursRemovedAdmin = ({
  openingHourCategory,
  timeDuration: { start, end },
  editSeriesFromIndex,
}) => {
  return cy
    .get('tbody[role="presentation"]')
    .should("be.visible")
    .find('div[data-cy="opening-hours-editor-event-content"]')
    .should("have.length", editSeriesFromIndex)
    .each((element) => {
      cy.wrap(element)
        .should("contain", openingHourCategory)
        .and("contain", `${start} - ${end}`);
    });
};

const validateOpeningHoursNotPresentPage = ({
  openingHourCategory,
  timeDuration: { start, end },
}: OpeningHourFormType) => {
  cy.getBySel("opening-hours-week-list")
    .should("be.visible")
    .should("not.contain", openingHourCategory)
    .should("not.contain", `${start} - ${end}`)
    .contains("The library is closed this day");
};

const validateOpeningHoursNotPresentAdmin = ({
  openingHourCategory,
  timeDuration: { start, end },
}: OpeningHourFormType) => {
  cy.get('tbody[role="presentation"]')
    .should("be.visible")
    .should("not.contain", openingHourCategory)
    .should("not.contain", `${start} - ${end}`);
};

const confirmEditRepeatedOpeningHourForm = (value?: "all") => {
  const selector =
    value === "all"
      ? "opening-hours-editor-form__radio-all"
      : "opening-hours-editor-form__radio-this";
  cy.getBySel(selector).click();

  // Need to reload the page to get the updated opening hours
  confirmAddRepeatedOpeningHourForm();
  visitOpeningHoursPageAdmin();
  navigateToMonthViewAdmin();
};

const createOpeningHour = ({
  openingHourCategory,
  timeDuration: { start, end },
}: OpeningHourFormType) => {
  visitOpeningHoursPageAdmin();
  navigateToMonthViewAdmin();
  selectTodayFromMonthViewAdmin();
  fillOpeningHourForm({ openingHourCategory, timeDuration: { start, end } });
  submitOpeningHourForm();
  validateAtLeastOneOpeningHoursExistAdmin({
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
  visitOpeningHoursPageAdmin();
  navigateToNextWeekOrMonthAdmin();
  selectTimeOnThursdayFromWeekView(start);
  fillOpeningHourForm({ openingHourCategory, timeDuration: { end } });
  cy.getBySel("opening-hours-editor-form-start-time").should(
    "have.attr",
    "value",
    start
  );
  submitOpeningHourForm();
  visitOpeningHoursPage();
  validateOpeningHoursNotPresentPage({
    openingHourCategory,
    timeDuration: { start, end },
  });
  cy.getBySel("opening-hours-next-week-button").click();
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
  visitOpeningHoursPageAdmin();
  navigateToMonthViewAdmin();
  navigateToFirstJanuary2024("monthViewAdmin");
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
  validateAtLeastOneOpeningHoursExistAdmin({
    openingHourCategory,
    timeDuration: { start, end },
  });
  navigateToNextWeekOrMonthAdmin();
  validateAtLeastOneOpeningHoursExistAdmin({
    openingHourCategory,
    timeDuration: { start, end },
  });
  visitOpeningHoursPage();
  navigateToFirstJanuary2024("weekViewPage");
  // Because we use firstDateOfFebruary2024 as endDate we can check the four next weeks
  for (let i = 0; i < 5; i++) {
    validateOpeningHoursPage({
      openingHourCategory,
      timeDuration: { start, end },
    });
    cy.getBySel("opening-hours-next-week-button").click();
  }
};

const updateOpeningHour = ({
  openingHourCategory,
  timeDuration: { start, end },
}: OpeningHourFormType) => {
  // Assume that the event is already created and is visible
  visitOpeningHoursPageAdmin();
  navigateToMonthViewAdmin();
  cy.getBySel("opening-hours-editor-event-content")
    .contains(openingHourCategory)
    .click();
  fillOpeningHourForm({ timeDuration: { start, end } });
  submitOpeningHourForm();
  validateAtLeastOneOpeningHoursExistAdmin({
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
  visitOpeningHoursPageAdmin();
  navigateToMonthViewAdmin();
  navigateToFirstJanuary2024("monthViewAdmin");
  cy.getBySel("opening-hours-editor-event-content")
    .eq(editSeriesFromIndex)
    .contains(openingHourCategory)
    .click();
  fillOpeningHourForm({ timeDuration: { start, end } });
  submitOpeningHourForm();
  confirmEditRepeatedOpeningHourForm("all");
  navigateToFirstJanuary2024("monthViewAdmin");
  // This validates if all the opening hours are updated
  if (editSeriesFromIndex === 0) {
    validateAtLeastOneOpeningHoursExistAdmin({
      openingHourCategory,
      timeDuration: { start, end },
    });
    navigateToNextWeekOrMonthAdmin();
    validateAtLeastOneOpeningHoursExistAdmin({
      openingHourCategory,
      timeDuration: { start, end },
    });
    visitOpeningHoursPage();
    navigateToFirstJanuary2024("weekViewPage");
    // Because we use oneMonthFromToday as endDate we can check the four next weeks
    for (let i = 0; i < 5; i++) {
      validateOpeningHoursPage({
        openingHourCategory,
        timeDuration: { start, end },
      });
      cy.getBySel("opening-hours-next-week-button").click();
    }
  }
};

const deleteOpeningHour = ({
  openingHourCategory,
  timeDuration: { start, end },
}: OpeningHourFormType) => {
  visitOpeningHoursPageAdmin();
  navigateToMonthViewAdmin();
  validateAtLeastOneOpeningHoursExistAdmin({
    openingHourCategory,
    timeDuration: { start, end },
  }).click();
  cy.getBySel("opening-hours-editor-form__remove").click();
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
  visitOpeningHoursPageAdmin();
  navigateToMonthViewAdmin();
  navigateToFirstJanuary2024("monthViewAdmin");
  validateAtLeastOneOpeningHoursExistAdmin({
    openingHourCategory,
    timeDuration: { start, end },
  })
    .first()
    .click();
  cy.getBySel("opening-hours-editor-form__remove").click();
  confirmEditRepeatedOpeningHourForm("all");
  navigateToFirstJanuary2024("monthViewAdmin");
  validateOpeningHoursNotPresentAdmin({
    openingHourCategory,
    timeDuration: { start, end },
  });
  visitOpeningHoursPage();
  navigateToFirstJanuary2024("weekViewPage");
  // // Because we use firstDateOfFebruary2024 as endDate we can check the four next weeks
  for (let i = 0; i < 5; i++) {
    validateOpeningHoursNotPresentPage({
      openingHourCategory,
      timeDuration: { start, end },
    });
    cy.getBySel("opening-hours-next-week-button").click();
  }
};

const deleteRestOfOpeningHoursSeries = ({
  openingHourCategory,
  timeDuration: { start, end },
  editSeriesFromIndex = 0,
}: OpeningHourFormType & { editSeriesFromIndex?: number }) => {
  visitOpeningHoursPageAdmin();
  navigateToMonthViewAdmin();
  navigateToFirstJanuary2024("monthViewAdmin");
  validateAtLeastOneOpeningHoursExistAdmin({
    openingHourCategory,
    timeDuration: { start, end },
  })
    .eq(editSeriesFromIndex)
    .click();
  cy.getBySel("opening-hours-editor-form__remove").click();
  confirmEditRepeatedOpeningHourForm("all");
};

describe("Opening hours editor", () => {
  beforeEach(() => {
    deleteAllTestBranchesIfExists();
    createTestBranchAndVisitOpeningHoursAdmin();
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
      timeDuration: { start: "08:00", end: "16:00" },
    });
  });

  it("Can update an opening hour", () => {
    createOpeningHour({
      openingHourCategory: OpeningHourCategories.PhoneTime,
      timeDuration: { start: "10:00", end: "11:00" },
    });
    updateOpeningHour({
      openingHourCategory: OpeningHourCategories.PhoneTime,
      timeDuration: { start: "10:00", end: "15:00" },
    });
  });

  it("Can delete an opening hour", () => {
    const openingHour: OpeningHourFormType = {
      openingHourCategory: OpeningHourCategories.WithService,
      timeDuration: { start: "10:00", end: "11:00" },
    };
    createOpeningHour(openingHour);
    deleteOpeningHour(openingHour);
  });

  it("Can create opening hour in next week", () => {
    createOpeningHourInNextWeek({
      openingHourCategory: OpeningHourCategories.CitizenService,
      timeDuration: { start: "10:00", end: "11:00" },
    });
  });

  it.skip("Can create opening hours series", () => {
    createOpeningHoursSeries({
      openingHourCategory: OpeningHourCategories.SelfService,
      timeDuration: { start: "10:00", end: "16:00" },
      endDate: firstDateOfFebruary2024,
    });
  });

  it.skip("Can edit all opening hours series", () => {
    createOpeningHoursSeries({
      openingHourCategory: OpeningHourCategories.SelfService,
      timeDuration: { start: "10:00", end: "16:00" },
      endDate: firstDateOfFebruary2024,
    });
    updateOpeningHoursSeries({
      openingHourCategory: OpeningHourCategories.SelfService,
      timeDuration: { start: "09:00", end: "15:00" },
    });
  });

  type EditRestOfOpeningHoursSeriesType = {
    editSeriesFromIndex: number;
    openingHourCategory: OpeningHourCategories;
    originalTimeDuration: TimeDurationType;
    updatedTimeDuration: TimeDurationType;
  };
  it.skip("Can edit rest of opening hours series", () => {
    const editData: EditRestOfOpeningHoursSeriesType = {
      editSeriesFromIndex: 1,
      openingHourCategory: OpeningHourCategories.SelfService,
      originalTimeDuration: { start: "10:00", end: "16:00" },
      updatedTimeDuration: { start: "09:00", end: "15:00" },
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

    navigateToFirstJanuary2024("monthViewAdmin");
    validateAtLeastOneOpeningHoursExistAdmin({
      openingHourCategory: editData.openingHourCategory,
      timeDuration: editData.originalTimeDuration,
    });

    validateAtLeastOneOpeningHoursExistAdmin({
      openingHourCategory: editData.openingHourCategory,
      timeDuration: editData.updatedTimeDuration,
    });
  });

  it.skip("Can delete all opening hours series", () => {
    const openingHour: Required<OpeningHourFormType> = {
      openingHourCategory: OpeningHourCategories.WithService,
      timeDuration: { start: "10:00", end: "11:00" },
      endDate: firstDateOfFebruary2024,
    };
    createOpeningHoursSeries(openingHour);
    deleteOpeningHoursSeries(openingHour);
  });

  it.skip("Can delete rest of opening hours series", () => {
    const editData: Required<OpeningHourFormType> & {
      editSeriesFromIndex: number;
    } = {
      openingHourCategory: OpeningHourCategories.WithService,
      timeDuration: { start: "10:00", end: "11:00" },
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

    navigateToFirstJanuary2024("monthViewAdmin");
    validateOpeningHoursRemovedAdmin({
      editSeriesFromIndex: editData.editSeriesFromIndex,
      openingHourCategory: editData.openingHourCategory,
      timeDuration: editData.timeDuration,
    });
  });
});
