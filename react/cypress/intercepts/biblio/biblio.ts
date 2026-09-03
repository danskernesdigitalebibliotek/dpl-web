import {
  type GetLoanQuotasApiResponse,
  type LoanDto,
  type ReservationDto,
  CanLoanResponseType
} from "@danskernesdigitalebibliotek/dpl-service-layer/biblio/contract";
import {
  biblioAcceptOfferFactory,
  biblioAudiobookLoanFactory,
  biblioCanLoanFactory,
  biblioCreateLoanFactory,
  biblioDeleteReservationFactory,
  biblioLoanFactory,
  biblioLoanQuotasFactory,
  biblioLoansFactory,
  biblioMetadataFactory,
  biblioReservationsFactory,
  biblioSupportIdFactory
} from "../../factories/biblio/biblio.factory";

/** Given: the user holds loans in Biblio. Defaults to one of each type. */
export const givenUserHasBiblioLoans = (loans?: LoanDto[]) => {
  const body = biblioLoansFactory.build({
    loans: loans ?? [
      biblioLoanFactory.build(),
      biblioAudiobookLoanFactory.build()
    ]
  });

  cy.intercept("GET", "**/v1/loans*", {
    statusCode: 200,
    body
  }).as("biblioLoans");

  return body.loans;
};

/** Given: the user holds no loans in Biblio. */
export const givenUserHasNoBiblioLoans = () => givenUserHasBiblioLoans([]);

/** Given: Biblio does not know this material. A 404 is a normal answer. */
export const givenMaterialIsNotInBiblio = (materialId: string) => {
  cy.intercept("GET", `**/v1/metadata/${materialId}*`, {
    statusCode: 404,
    body: { message: `Material not found: ${materialId}` }
  }).as(`biblioMetadataMissing_${materialId}`);
};

/** Given: Biblio provides this material and can describe it. */
export const givenMaterialIsInBiblio = (material: {
  isbn: string;
  title: string;
  materialType?: "ebook" | "audiobook";
}) => {
  cy.intercept("GET", `**/v1/metadata/${material.isbn}*`, {
    statusCode: 200,
    body: biblioMetadataFactory.build({
      materials: [
        {
          isbn: material.isbn,
          material_type: material.materialType ?? "ebook",
          title: material.title,
          author: ["Sherman, L."],
          description: "En intens romance",
          publish_date: "2022-06-18T00:00:00.000Z",
          publisher: "Lindhardt og Ringhof",
          languages: ["dan"],
          category: ["Moderne kærlighedshistorier"],
          thema_codes: ["FR"]
        }
      ]
    })
  }).as(`biblioMetadata_${material.isbn}`);
};

/** Given: the user's loan quotas in Biblio. Defaults to split-on-format. */
export const givenUserHasBiblioLoanQuotas = (
  quotas?: GetLoanQuotasApiResponse["loan_quotas"]
) => {
  cy.intercept("GET", "**/v1/users/get_loan_quotas*", {
    statusCode: 200,
    body: quotas
      ? biblioLoanQuotasFactory.build({ loan_quotas: quotas })
      : biblioLoanQuotasFactory.build()
  }).as("biblioLoanQuotas");
};

/** Given: the identifier the user can hand to support. */
export const givenUserHasBiblioSupportId = (supportId?: string) => {
  cy.intercept("GET", "**/v1/users/get_support_id*", {
    statusCode: 200,
    body: supportId
      ? biblioSupportIdFactory.build({ support_id: supportId })
      : biblioSupportIdFactory.build()
  }).as("biblioSupportId");
};

/** Given: whether Biblio will let the user borrow this material. */
export const givenBiblioCanLoan = (
  status: CanLoanResponseType = CanLoanResponseType.loanable
) => {
  cy.intercept("GET", "**/v1/loans/can-loan*", {
    statusCode: 200,
    body: biblioCanLoanFactory.build({ status })
  }).as("biblioCanLoan");
};

/**
 * Given: creating a loan in Biblio succeeds. The adapter answers 201 with the
 * created loan; one it accepts but declines to fulfil comes back without one.
 */
export const givenBiblioCreatesLoan = (loan?: LoanDto) => {
  cy.intercept("POST", "**/v1/loans", {
    statusCode: 201,
    body: biblioCreateLoanFactory.build(loan ? { loan } : {})
  }).as("biblioCreateLoan");
};

/**
 * Given: the user holds reservations in Biblio. One with an `offer_id` has
 * been offered and can be accepted as a loan.
 */
export const givenUserHasBiblioReservations = (
  reservations: ReservationDto[] = []
) => {
  cy.intercept("GET", "**/v1/reservations*", {
    statusCode: 200,
    body: biblioReservationsFactory.build({ reservations })
  }).as("biblioReservations");
};

/** Given: the user holds no reservations in Biblio. */
export const givenUserHasNoBiblioReservations = () =>
  givenUserHasBiblioReservations([]);

/** Given: creating a reservation in Biblio succeeds. */
export const givenBiblioCreatesReservation = () => {
  cy.intercept("POST", "**/v1/reservations", {
    statusCode: 201,
    body: biblioCreateLoanFactory.build({
      status: CanLoanResponseType.reservable
    })
  }).as("biblioCreateReservation");
};

/**
 * Given: cancelling a reservation in Biblio succeeds. The route matches any
 * id, so a test asserts which one was cancelled from the request URL.
 */
export const givenBiblioCancelsReservation = (success = true) => {
  cy.intercept("DELETE", "**/v1/reservations/*", {
    statusCode: 200,
    body: biblioDeleteReservationFactory.build({ success })
  }).as("biblioCancelReservation");
};

/**
 * Given: accepting an offered reservation turns it into a loan.
 *
 * Pass `success: false` for an offer the adapter refuses to convert, eg. one
 * that has expired in the meantime.
 */
export const givenBiblioAcceptsOffer = (success = true) => {
  cy.intercept("POST", "**/v1/reservations/accept-offer", {
    statusCode: 200,
    body: biblioAcceptOfferFactory.build(
      success ? {} : { success: false, loan_id: undefined }
    )
  }).as("biblioAcceptOffer");
};
