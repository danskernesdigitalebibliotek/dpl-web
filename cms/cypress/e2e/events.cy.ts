import * as dayjs from "dayjs";
import "cypress-if";

const events = {
  singleEvent: {
    title: "Single event",
    subtitle: "A subtitle",
    recurType: "Custom/Single Event",
    start: dayjs("2030-01-01T10:00:00"),
    end: dayjs("2030-01-01T16:00:00"),
  },
};

describe("Events", () => {
  it("can be created with a single occurrence", () => {
    // Login as admin.
    cy.drupalLogin("/events/add/default");
    cy.findByLabelText("Title").type(events.singleEvent.title);
    cy.findByLabelText("Subtitle").type(events.singleEvent.subtitle);
    cy.findByLabelText("Recur Type").select(events.singleEvent.recurType, {
      // We have to use force when using Select2.
      force: true,
    });
    cy.findByText("Start date")
      .siblings()
      .findByLabelText("Date")
      .type(events.singleEvent.start.format("YYYY-MM-DD"));
    cy.findByText("Start date")
      .siblings()
      .findByLabelText("Time")
      .type(events.singleEvent.start.format("HH:mm"));
    cy.findByText("End date")
      .siblings()
      .findByLabelText("Date")
      .type(events.singleEvent.end.format("YYYY-MM-DD"));
    cy.findByText("End date")
      .siblings()
      .findByLabelText("Time")
      .type(events.singleEvent.end.format("HH:mm"));
    cy.findByRole("button", { name: "Save" }).click();

    // Ensure that the core data from the event is displayed on the resulting page.
    // @todo This should probably be replaced by a visual regression test.
    cy.contains(events.singleEvent.title);
    cy.contains(events.singleEvent.start.format("DD MMMM YYYY"));
    cy.contains(
      `${events.singleEvent.start.format(
        "HH:mm"
      )} - ${events.singleEvent.end.format("HH:mm")}`
    );
  });

  before(() => {
    cy.drupalLogin("/admin/content/eventseries");
    // Delete all preexisting instances of each event.
    cy.get("a")
      .contains(events.singleEvent.title)
      .if()
      .each(() => {
        // We have to repeat the selector as Cypress will otherwise complain about
        // missing references to elements when clicking the page.
        cy.findAllByRole("link", { name: events.singleEvent.title })
          .first()
          .click();
        cy.findByRole("link", {
          name: `Edit ${events.singleEvent.title}`,
        }).click();
        cy.findByRole("button", { name: "More actions" })
          .click()
          .parent()
          .findByRole("link", { name: "Delete" })
          .click();
        cy.findByRole("dialog")
          .findByRole("button", { name: "Delete" })
          .click();
        cy.visit("/admin/content/eventseries");
      });
  });
});
