import { TOKEN_LIBRARY_KEY, TOKEN_USER_KEY } from "../../src/core/token";
import {
  BIBLIO_MATERIAL,
  biblioOfferedReservationFactory,
  biblioReservationFactory
} from "../factories/biblio/biblio.factory";
import {
  givenBiblioCancelsReservation,
  givenMaterialIsInBiblio,
  givenMaterialIsNotInBiblio,
  givenUserHasBiblioReservations
} from "./biblio/biblio";
import { publizonProductFactory } from "../factories/publizon/publizon.factory";

/**
 * The digital reservations every Biblio reservation-list test starts from:
 * one older reservation still held in Publizon and two created through the
 * service layer, one queued and one already offered to the user.
 *
 * Shared by the flag-off spec, which proves the adapter is never contacted,
 * and the journey spec, which cancels one of them - so both describe the
 * same library.
 */

export const PUBLIZON_ISBN = "9788771076940";
export const PUBLIZON_TITLE = "Tættere end man tror";

export const BIBLIO_QUEUED_ISBN = BIBLIO_MATERIAL.ebook.isbn;
export const BIBLIO_QUEUED_TITLE = BIBLIO_MATERIAL.ebook.title;
export const BIBLIO_OFFERED_ISBN = BIBLIO_MATERIAL.audiobook.isbn;
export const BIBLIO_OFFERED_TITLE = BIBLIO_MATERIAL.audiobook.title;

// The reservation Biblio cancels by - deliberately not the ISBN, which is
// what Publizon would have used.
export const BIBLIO_QUEUED_RESERVATION_ID =
  "e5b4bbd1-6d63-4a24-9a25-2f0f4e9b1f11";

export const stubReservationListBackends = () => {
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

  // These specs are about the digital reservations, so the user holds no
  // physical ones.
  cy.intercept("GET", "**/external/agencyid/patrons/patronid/reservations/v*", {
    statusCode: 200,
    body: []
  });

  // Given: one older reservation still held in Publizon, still queued
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

  // Given: two reservations created through the service layer - one still
  // queued, one already offered to the user.
  givenUserHasBiblioReservations([
    biblioReservationFactory.build({
      id: BIBLIO_QUEUED_RESERVATION_ID,
      material_id: BIBLIO_QUEUED_ISBN,
      loan_date: "2022-11-10T06:32:30.000Z"
    }),
    biblioOfferedReservationFactory.build({
      material_id: BIBLIO_OFFERED_ISBN
    })
  ]);

  // A reservation carries no title, unlike a loan, so every provider is asked
  // to describe its own material.
  givenMaterialIsNotInBiblio(PUBLIZON_ISBN);
  givenMaterialIsInBiblio({
    isbn: BIBLIO_QUEUED_ISBN,
    title: BIBLIO_QUEUED_TITLE
  });
  givenMaterialIsInBiblio({
    isbn: BIBLIO_OFFERED_ISBN,
    title: BIBLIO_OFFERED_TITLE,
    materialType: "audiobook"
  });

  cy.intercept("GET", `**/v1/products/${PUBLIZON_ISBN}*`, {
    statusCode: 200,
    body: publizonProductFactory.build({
      product: {
        title: PUBLIZON_TITLE,
        productType: 1,
        externalProductId: { idType: 15, id: PUBLIZON_ISBN },
        publisher: "Jentas",
        publicationDate: "2016-05-12T00:00:00Z",
        contributors: [
          { type: "A01", firstName: "Jussi", lastName: "Adler-Olsen" }
        ]
      }
    })
  }).as("publizonProduct");

  // If either of these ever reaches the rendered list, a Biblio material was
  // described by the wrong provider.
  cy.intercept("GET", `**/v1/products/${BIBLIO_QUEUED_ISBN}*`, {
    statusCode: 200,
    body: publizonProductFactory.build({
      product: {
        title: "Wrong provider",
        productType: 1,
        externalProductId: { idType: 15, id: BIBLIO_QUEUED_ISBN }
      }
    })
  }).as("publizonProductBiblioIsbn");

  givenBiblioCancelsReservation();

  // Publizon's own cancel endpoint. Aliased purely so a spec can prove it was
  // never called for a Biblio reservation.
  cy.intercept("DELETE", "**/v1/user/reservations/**", {
    statusCode: 200,
    body: { code: 101, message: "OK" }
  }).as("publizonCancelReservation");

  cy.interceptGraphql({
    operationName: "GetCoversByPids",
    fixtureFilePath: "cover/cover.json"
  });
  cy.interceptGraphql({
    operationName: "GetBestRepresentationPidByIsbn",
    fixtureFilePath: "cover/cover-get-best-representation-by-isbn.json"
  });
  // The details modal links to the material's work page, which is looked up
  // by ISBN because a digital material carries no pid.
  cy.interceptGraphql({
    operationName: "complexSearchWithPagination",
    fixtureFilePath: "reservation-details/complex-search-with-pagination.json"
  });
};
