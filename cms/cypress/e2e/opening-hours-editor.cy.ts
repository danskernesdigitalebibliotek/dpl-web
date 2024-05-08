const branchTitle = "Test branch";

enum OpeningHourCategories {
  Opening = "Åbent",
  CitizenService = "Borgerservice",
  WithService = "Med betjening",
  SelfService = "Selvbetjening",
  PhoneTime = "Telefontid",
}

type TimeString = `${number}:${number}`;

type OpeningHourFormType = {
  openingHourCategory: OpeningHourCategories;
  start: TimeString;
  end: TimeString;
  endDate?: string;
};

const oneMonthFromToday = () =>
  new Date(new Date().setMonth(new Date().getMonth() + 1))
    .toISOString()
    .slice(0, 10);

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

const selectTimeOnThursdayFromWeekView = ({
  start,
}: Pick<OpeningHourFormType, "start">): void => {
  // In FullCalendar, the date and time elements are siblings in the same overlaying div, which prevents selection by both date and time simultaneously.
  // To work around this, we target a specific time slot. This example selects the a time slot, which spans all days.
  // Since Cypress clicks at the center of the target element by default, and our time slots extend across all weekdays, it will interact with the slot for Thursday.
  cy.get(`td.fc-timegrid-slot-lane[data-time="${start}:00"]`).click();
};

const fillOpeningHourForm = ({
  openingHourCategory,
  start,
  end,
  endDate,
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
  start,
  end,
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
  start,
  end,
}: OpeningHourFormType) => {
  cy.getBySel("opening-hours-week-list")
    .should("be.visible")
    .and("contain", openingHourCategory)
    .and("contain", `${start} - ${end}`);
};

const validateAtLeastOneOpeningHoursExistAdmin = ({
  openingHourCategory,
  start,
  end,
}: OpeningHourFormType) => {
  return cy
    .get('tbody[role="presentation"]')
    .should("be.visible")
    .find('div[data-cy="opening-hours-editor-event-content"]')
    .should("have.length.gte", 1)
    .each((element) => {
      cy.wrap(element)
        .should("contain", openingHourCategory)
        .and("contain", `${start} - ${end}`);
    });
};

const validateOpeningHoursChangesAdmin = ({
  openingHourCategory,
  originalStart,
  originalEnd,
  updatedStart,
  updatedEnd,
  editSeriesFromIndex,
}) => {
  return cy
    .get('tbody[role="presentation"]')
    .should("be.visible")
    .find('div[data-cy="opening-hours-editor-event-content"]')
    .should("have.length.gte", 1)
    .each((element, index) => {
      cy.wrap(element)
        .should("contain", openingHourCategory)
        .and(
          "contain",
          index < editSeriesFromIndex
            ? `${originalStart} - ${originalEnd}`
            : `${updatedStart} - ${updatedEnd}`
        );
    });
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

const validateOpeningHoursNotPresentAdmin = ({
  openingHourCategory,
  start,
  end,
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
  start,
  end,
}: OpeningHourFormType) => {
  visitOpeningHoursPageAdmin();
  navigateToMonthViewAdmin();
  selectTodayFromMonthViewAdmin();
  fillOpeningHourForm({ openingHourCategory, start, end });
  submitOpeningHourForm();
  validateAtLeastOneOpeningHoursExistAdmin({ openingHourCategory, start, end });
  visitOpeningHoursPage();
  validateOpeningHoursPage({ openingHourCategory, start, end });
};

const createOpeningHourInNextWeek = ({
  openingHourCategory,
  start,
  end,
}: OpeningHourFormType) => {
  visitOpeningHoursPageAdmin();
  navigateToNextWeekOrMonthAdmin();
  selectTimeOnThursdayFromWeekView({ start });
  fillOpeningHourForm({ openingHourCategory, end });
  cy.getBySel("opening-hours-editor-form-start-time").should(
    "have.attr",
    "value",
    start
  );
  submitOpeningHourForm();
  visitOpeningHoursPage();
  validateOpeningHoursNotPresentPage({
    openingHourCategory,
    start,
    end,
  });
  cy.getBySel("opening-hours-next-week-button").click();
  validateOpeningHoursPage({ openingHourCategory, start, end });
};

const createOpeningHoursSeries = ({
  openingHourCategory,
  start,
  end,
  endDate,
}: Required<OpeningHourFormType>) => {
  visitOpeningHoursPageAdmin();
  navigateToMonthViewAdmin();
  selectTodayFromMonthViewAdmin();
  fillOpeningHourForm({ openingHourCategory, start, end, endDate });
  submitOpeningHourForm();
  checkConfirmationDialog({ openingHourCategory, start, end, endDate });
  confirmAddRepeatedOpeningHourForm();
  validateAtLeastOneOpeningHoursExistAdmin({ openingHourCategory, start, end });
  navigateToNextWeekOrMonthAdmin();
  validateAtLeastOneOpeningHoursExistAdmin({ openingHourCategory, start, end });
  visitOpeningHoursPage();
  // Because we use oneMonthFromToday as endDate we can check the four next weeks
  for (let i = 0; i < 5; i++) {
    validateOpeningHoursPage({ openingHourCategory, start, end });
    cy.getBySel("opening-hours-next-week-button").click();
  }
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
  validateAtLeastOneOpeningHoursExistAdmin({ openingHourCategory, start, end });
  visitOpeningHoursPage();
  validateOpeningHoursPage({ openingHourCategory, start, end });
};

const updateOpeningHoursSeries = ({
  openingHourCategory,
  start,
  end,
  editSeriesFromIndex = 0,
}: OpeningHourFormType & { editSeriesFromIndex?: number }) => {
  // Assume that the event is already created and is visible
  visitOpeningHoursPageAdmin();
  navigateToMonthViewAdmin();
  cy.getBySel("opening-hours-editor-event-content")
    .eq(editSeriesFromIndex)
    .contains(openingHourCategory)
    .click();
  fillOpeningHourForm({ start, end });
  submitOpeningHourForm();
  confirmEditRepeatedOpeningHourForm("all");

  // This validates if all the opening hours are updated
  if (editSeriesFromIndex === 0) {
    validateAtLeastOneOpeningHoursExistAdmin({
      openingHourCategory,
      start,
      end,
    });
    navigateToNextWeekOrMonthAdmin();
    validateAtLeastOneOpeningHoursExistAdmin({
      openingHourCategory,
      start,
      end,
    });
    visitOpeningHoursPage();
    // Because we use oneMonthFromToday as endDate we can check the four next weeks
    for (let i = 0; i < 5; i++) {
      validateOpeningHoursPage({ openingHourCategory, start, end });
      cy.getBySel("opening-hours-next-week-button").click();
    }
  }
};

const deleteOpeningHour = ({
  openingHourCategory,
  start,
  end,
}: OpeningHourFormType) => {
  visitOpeningHoursPageAdmin();
  navigateToMonthViewAdmin();
  validateAtLeastOneOpeningHoursExistAdmin({
    openingHourCategory,
    start,
    end,
  }).click();
  cy.getBySel("opening-hours-editor-form__remove").click();
  validateOpeningHoursNotPresentAdmin({
    openingHourCategory,
    start,
    end,
  });
  visitOpeningHoursPage();
  validateOpeningHoursNotPresentPage({
    openingHourCategory,
    start,
    end,
  });
};

const deleteOpeningHoursSeries = ({
  openingHourCategory,
  start,
  end,
}: OpeningHourFormType) => {
  visitOpeningHoursPageAdmin();
  navigateToMonthViewAdmin();
  validateAtLeastOneOpeningHoursExistAdmin({
    openingHourCategory,
    start,
    end,
  })
    .first()
    .click();
  cy.getBySel("opening-hours-editor-form__remove").click();
  confirmEditRepeatedOpeningHourForm("all");
  validateOpeningHoursNotPresentAdmin({
    openingHourCategory,
    start,
    end,
  });
  visitOpeningHoursPage();
  // // Because we use oneMonthFromToday as endDate we can check the four next weeks
  for (let i = 0; i < 5; i++) {
    validateOpeningHoursNotPresentPage({
      openingHourCategory,
      start,
      end,
    });
    cy.getBySel("opening-hours-next-week-button").click();
  }
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
    const openingHour: OpeningHourFormType = {
      openingHourCategory: OpeningHourCategories.WithService,
      start: "10:00",
      end: "11:00",
    };
    createOpeningHour(openingHour);
    deleteOpeningHour(openingHour);
  });

  it("Can create opening hour in next week", () => {
    createOpeningHourInNextWeek({
      openingHourCategory: OpeningHourCategories.CitizenService,
      start: "10:00",
      end: "11:00",
    });
  });

  it("Can create opening hours series", () => {
    createOpeningHoursSeries({
      openingHourCategory: OpeningHourCategories.SelfService,
      start: "10:00",
      end: "16:00",
      endDate: oneMonthFromToday(),
    });
  });

  it("Can edit all opening hours series", () => {
    createOpeningHoursSeries({
      openingHourCategory: OpeningHourCategories.SelfService,
      start: "10:00",
      end: "16:00",
      endDate: oneMonthFromToday(),
    });
    updateOpeningHoursSeries({
      openingHourCategory: OpeningHourCategories.SelfService,
      start: "09:00",
      end: "15:00",
    });
  });

  type EditRestOfOpeningHoursSeriesType = {
    editSeriesFromIndex: number;
    openingHourCategory: OpeningHourCategories;
    originalStart: TimeString;
    originalEnd: TimeString;
    updatedStart: TimeString;
    updatedEnd: TimeString;
  };

  it("Can edit rest of opening hours series", () => {
    const {
      originalStart,
      originalEnd,
      updatedStart,
      updatedEnd,
      openingHourCategory,
      editSeriesFromIndex,
    }: EditRestOfOpeningHoursSeriesType = {
      editSeriesFromIndex: 2,
      openingHourCategory: OpeningHourCategories.SelfService,
      originalStart: "10:00",
      originalEnd: "16:00",
      updatedStart: "09:00",
      updatedEnd: "15:00",
    };

    createOpeningHoursSeries({
      openingHourCategory,
      start: originalStart,
      end: originalEnd,
      endDate: oneMonthFromToday(),
    });

    updateOpeningHoursSeries({
      editSeriesFromIndex,
      openingHourCategory,
      start: updatedStart,
      end: updatedEnd,
    });

    validateOpeningHoursChangesAdmin({
      editSeriesFromIndex,
      openingHourCategory,
      originalStart,
      originalEnd,
      updatedStart,
      updatedEnd,
    });
  });

  it("Can delete all opening hours series", () => {
    const openingHour: Required<OpeningHourFormType> = {
      openingHourCategory: OpeningHourCategories.WithService,
      start: "10:00",
      end: "11:00",
      endDate: oneMonthFromToday(),
    };
    createOpeningHoursSeries(openingHour);
    deleteOpeningHoursSeries(openingHour);
  });
});
