import {
  MaterialPage,
  materialStory
} from "../../../cypress/page-objects/material/MaterialPage";
import { ContentLoanStatusEnum } from "../../core/publizon/model";
import { stubMaterialPageBackends } from "../../../cypress/intercepts/material-page";
import { TOKEN_USER_KEY } from "../../core/token";

/**
 * TEMPORARY: the material page while the Publizon reservation queue stands
 * still for migration.
 *
 * Biblio copies the queue over, so a reservation created after the copy is
 * simply lost - and refusing it silently would leave the patron in front of a
 * dead button. The spec therefore pins both halves: nothing reaches Publizon,
 * and the page says why. The freeze covers the queue only, which is why the
 * unfrozen page is asserted from the same backends.
 */

// Publizon answers the whole loan decision with one status, and the two that
// matter here are mutually exclusive: 5 is on loan but queueable, 4 is
// available to borrow right now.
const ON_LOAN = ContentLoanStatusEnum.NUMBER_5;
const AVAILABLE = ContentLoanStatusEnum.NUMBER_4;

// The button that carries whichever action the material offers.
const ACTION_BUTTON = "material-header-buttons-online-internal-reader";
const RESERVATIONS_CLOSED_TEXT =
  "Reservations of digital materials are closed while we are moving to a new service.";

// The backends sign a patron in; dropping the token again is what makes the
// visit anonymous.
const givenTheVisitorIsNotSignedIn = () =>
  cy.window().then((win) => win.sessionStorage.removeItem(TOKEN_USER_KEY));

const openEbook = (material: MaterialPage) => {
  material.visit([]);
  // The e-book edition is reached from the availability labels.
  cy.getBySel("availability-label").contains("e-bog").first().click();
};

describe("Material page - the Publizon reservation queue frozen", () => {
  beforeEach(() => {
    // Stubbed so a reservation that slipped through would be recorded rather
    // than failing on an unstubbed request.
    cy.intercept("POST", "**/v1/user/reservations/**", {
      statusCode: 200,
      body: {}
    }).as("publizonCreateReservation");
  });

  it("Refuses the reservation and tells the patron why", () => {
    stubMaterialPageBackends(ON_LOAN);

    const material = new MaterialPage(
      materialStory.withClosedPublizonReservations,
      "e-bog"
    );

    openEbook(material);

    // Then: the action the patron came for is still named - it is unavailable,
    // not gone - and it cannot be used
    cy.getBySel(ACTION_BUTTON)
      .first()
      .should("be.disabled")
      .and("contain", "Reserve");

    // And: the reason stands next to it
    cy.contains(RESERVATIONS_CLOSED_TEXT).should("be.visible");

    // And: nothing was sent to Publizon. Asserted after the loan status has
    // come back, so this is a page that has decided rather than one still
    // asking.
    cy.get("@publizonLoanStatus.all").should("have.length.at.least", 1);
    cy.get("@publizonCreateReservation.all").should("have.length", 0);
  });

  it("Takes the reservation as usual outside the freeze", () => {
    stubMaterialPageBackends(ON_LOAN);

    const material = new MaterialPage(materialStory.default, "e-bog");

    openEbook(material);

    cy.getBySel(ACTION_BUTTON)
      .first()
      .should("be.enabled")
      .and("contain", "Reserve");
    cy.contains(RESERVATIONS_CLOSED_TEXT).should("not.exist");
  });

  it("Still lends a material that is available", () => {
    // The freeze covers the queue, not lending - a library keeps lending
    // through Publizon while its reservations are moved. This is the
    // expensive half to get wrong: it would take the whole catalogue offline.
    stubMaterialPageBackends(AVAILABLE);

    const material = new MaterialPage(
      materialStory.withClosedPublizonReservations,
      "e-bog"
    );

    openEbook(material);

    cy.getBySel(ACTION_BUTTON)
      .first()
      .should("be.enabled")
      .and("contain", "Loan");
    cy.contains(RESERVATIONS_CLOSED_TEXT).should("not.exist");
  });

  it("Refuses a visitor who is not signed in too, rather than offering a loan", () => {
    // A Publizon material has always shown its reservation button before
    // login - the login guard takes over on click - so a closed queue has to
    // be visible there as well. Without this the button would fall through to
    // the acquire branch, which offers a not-signed-in visitor the loan, and
    // promise an action this material cannot honour.
    stubMaterialPageBackends(ON_LOAN);
    givenTheVisitorIsNotSignedIn();

    const material = new MaterialPage(
      materialStory.withClosedPublizonReservations,
      "e-bog"
    );

    openEbook(material);

    cy.getBySel(ACTION_BUTTON)
      .first()
      .should("be.disabled")
      .and("contain", "Reserve");
    cy.contains(RESERVATIONS_CLOSED_TEXT).should("be.visible");
  });
});
