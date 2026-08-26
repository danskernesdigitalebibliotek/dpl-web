import { TOKEN_LIBRARY_KEY, TOKEN_USER_KEY } from "../../../core/token";
import {
  ReservationListPage,
  reservationListStory
} from "../../../../cypress/page-objects/reservation-list/ReservationListPage";
import { biblioReservationFactory } from "../../../../cypress/factories/biblio/biblio.factory";
import {
  givenMaterialIsInBiblio,
  givenMaterialIsNotInBiblio,
  givenUserHasBiblioReservations
} from "../../../../cypress/intercepts/biblio/biblio";
import { publizonProductFactory } from "../../../../cypress/factories/publizon/publizon.factory";

/**
 * Feature flag gating for the Biblio adapter on the digital reservations.
 *
 * A library that has enabled the flag must see BOTH its existing Publizon
 * reservations and its new Biblio ones; a library that has not must be
 * completely unaffected - the adapter is not even contacted.
 *
 * The Biblio body is built from the factory typed against the generated
 * contract client, so a response that drifts from
 * `schemas/openapi/biblio-adapter.yaml` fails to typecheck.
 *
 * What a user then does with those reservations - reading them and cancelling
 * one - is covered by reservation-list-biblio-journey.test.ts.
 */

const PUBLIZON_ISBN = "9788771076940";
const BIBLIO_ISBN = "9788727319346";
const PUBLIZON_TITLE = "A reservation from Publizon";
const BIBLIO_TITLE = "A reservation from Biblio";

const stubBackends = () => {
  cy.window().then((win) => {
    const friday20221021 = new Date("2022-10-21T10:00:00.000").getTime();
    // Only Date is faked. Freezing setTimeout would stall TanStack Query's
    // notify scheduler, leaving every component stuck in its loading state.
    cy.clock(friday20221021, ["Date"]);
    win.sessionStorage.setItem(TOKEN_LIBRARY_KEY, "random-token");
    // Reservations are patron-scoped: the adapter answers 403 without a
    // patron, so the service layer refuses to ask. This is a signed-in page.
    win.sessionStorage.setItem(TOKEN_USER_KEY, "random-user-token");
  });

  cy.intercept("GET", "**/external/agencyid/patrons/patronid/v4**", {
    patron: { blockStatus: null }
  }).as("user");

  // Physical reservations are irrelevant here and kept empty.
  cy.intercept("GET", "**/external/agencyid/patrons/patronid/reservations/v*", {
    statusCode: 200,
    body: []
  });

  // Given: one existing digital reservation in Publizon, still queued
  cy.intercept("GET", "**/v1/user/**", {
    statusCode: 200,
    body: {
      reservations: [
        {
          identifier: PUBLIZON_ISBN,
          createdDateUtc: "2022-10-18T06:32:30Z",
          expectedRedeemDateUtc: "2022-11-05T06:32:30Z",
          expireDateUtc: "2022-11-20T06:32:30Z",
          productTitle: PUBLIZON_TITLE,
          status: 1
        }
      ]
    }
  }).as("publizonReservations");

  // Given: one reservation created through the service layer
  givenUserHasBiblioReservations([
    biblioReservationFactory.build({ material_id: BIBLIO_ISBN })
  ]);

  // A reservation carries no title, so both providers are described through
  // their metadata endpoints.
  givenMaterialIsNotInBiblio(PUBLIZON_ISBN);
  givenMaterialIsInBiblio({ isbn: BIBLIO_ISBN, title: BIBLIO_TITLE });

  cy.intercept("GET", `**/v1/products/${PUBLIZON_ISBN}*`, {
    statusCode: 200,
    body: publizonProductFactory.build({
      product: {
        title: PUBLIZON_TITLE,
        productType: 1,
        externalProductId: { idType: 15, id: PUBLIZON_ISBN }
      }
    })
  });

  // If this ever reaches the rendered list, the Biblio material was described
  // by the wrong provider.
  cy.intercept("GET", `**/v1/products/${BIBLIO_ISBN}*`, {
    statusCode: 200,
    body: publizonProductFactory.build({
      product: {
        title: "Wrong provider",
        productType: 1,
        externalProductId: { idType: 15, id: BIBLIO_ISBN }
      }
    })
  }).as("publizonProductBiblioIsbn");

  cy.interceptGraphql({
    operationName: "GetCoversByPids",
    fixtureFilePath: "cover/cover.json"
  });

  cy.interceptGraphql({
    operationName: "GetBestRepresentationPidByIsbn",
    fixtureFilePath: "cover/cover-get-best-representation-by-isbn.json"
  });
};

describe("Reservation list - Biblio adapter feature flag", () => {
  beforeEach(() => stubBackends());

  it("Shows reservations from both providers when the flag is on", () => {
    const reservationList = new ReservationListPage(
      reservationListStory.withBiblioAdapter
    );

    // When: the user opens the reservation list
    reservationList.visit([]);
    cy.wait(["@publizonReservations", "@biblioReservations"]);

    // Then: both providers are represented
    cy.contains(PUBLIZON_TITLE).should("exist");
    cy.contains(BIBLIO_TITLE).should("exist");

    // And: the Biblio material is described by Biblio, not by Publizon
    cy.contains("Wrong provider").should("not.exist");
    cy.get("@publizonProductBiblioIsbn.all").should("have.length", 0);
  });

  it("Leaves the adapter alone when the flag is off", () => {
    const reservationList = new ReservationListPage(
      reservationListStory.default
    );

    // When: the user opens the reservation list without the flag
    reservationList.visit([]);
    cy.wait("@publizonReservations");

    // Then: Publizon stays the only digital provider
    cy.contains(PUBLIZON_TITLE).should("exist");
    cy.contains(BIBLIO_TITLE).should("not.exist");

    cy.get("@biblioReservations.all").should("have.length", 0);
    cy.get(`@biblioMetadata_${BIBLIO_ISBN}.all`).should("have.length", 0);
  });
});
