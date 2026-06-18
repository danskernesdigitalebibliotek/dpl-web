import getV1UserLoansAdapterFactory from "../factories/ap/getV1UserLoansAdapter"
import getAdgangsplatformenUserToken from "../factories/dpl-cms/getAdgangsplatformenUserToken"
import getMaterial from "../factories/fbi/getMaterial"
import { mockFrontpage } from "../support/mocks"

const WORK_URL = "/work/work-of%3A870970-basis%3A136817027"
// Faust extracted from the BOOK manifestation's pid in the getMaterial fixture
// ("870970-basis:52398517"). pidToFaust → "52398517".
const RECORD_ID = "52398517"
const PICKUP_BRANCH_ID = "DK-710117"

// Requires FBS_BASE_URL=http://localhost:9000 in .env.test so the Next-server
// proxy forwards FBS calls to mockttp (registered via cy.mockServerRest).
// cy.intercept alone won't catch the server-side prefetch on the work page.

const setupAdgangsplatformenSession = () => {
  cy.createGoSession({ type: "adgangsplatformen" })
  cy.setCookie("go-session:type", "adgangsplatformen")
  cy.setCookie("SSESS_dpl_cms", "test-drupal-session")
  cy.mockServerGraphQLQuery({
    operationName: "getAdgangsplatformenUserToken",
    data: getAdgangsplatformenUserToken.build(),
  })
}

const mockEmptyLoans = () => {
  cy.intercept("GET", /\/(pubhub|ap-service\/pubhub-adapter)\/v1\/user\/loans(\?.*)?$/, {
    statusCode: 200,
    body: getV1UserLoansAdapterFactory.build({ loans: [] }),
    headers: { "content-type": "application/json" },
  })
}

const mockFbsPatron = (
  overrides: { emailAddress?: string | null; phoneNumber?: string | null } = {}
) => {
  cy.mockServerRest({
    method: "GET",
    path: "/external/agencyid/patrons/patronid/v4",
    data: {
      authenticateStatus: "VALID",
      patron: {
        name: "Test Bruger",
        preferredPickupBranch: PICKUP_BRANCH_ID,
        emailAddress: "emailAddress" in overrides ? overrides.emailAddress : "test@example.com",
        phoneNumber: "phoneNumber" in overrides ? overrides.phoneNumber : "+4512345678",
      },
    },
  })
}

const mockFbsHoldings = () => {
  cy.mockServerRest({
    method: "GET",
    path: "/external/agencyid/catalog/holdingsLogistics/v1",
    data: [{ recordId: RECORD_ID, reservations: 2, holdings: [{ materials: [{}, {}, {}] }] }],
  })
}

const mockFbsReservations = (reservations: unknown[]) => {
  cy.mockServerRest({
    method: "GET",
    path: "/external/v1/agencyid/patrons/patronid/reservations/v2",
    data: reservations,
  })
}

const mockBranches = () => {
  cy.interceptGraphql({
    operationName: "getBranch",
    data: { getBranch: { isilId: PICKUP_BRANCH_ID, title: "Hovedbiblioteket" } },
  })

  cy.mockServerGraphQLQuery({
    operationName: "getBranch",
    data: { getBranch: { isilId: PICKUP_BRANCH_ID, title: "Hovedbiblioteket" } },
  })
}

const visitPhysicalWork = () => {
  cy.interceptGraphql({
    operationName: "getMaterial",
    data: getMaterial.build(),
  })
  cy.visit(`${WORK_URL}?type=BOOK`)
}

describe("Reservation flow", () => {
  beforeEach(() => {
    mockFrontpage()
    cy.expectError("useMediaQuery is a client-only hook")
    cy.expectError("Minified React error #419")

    setupAdgangsplatformenSession()
    mockEmptyLoans()
    mockFbsPatron()
    mockFbsHoldings()
    mockBranches()
  })

  it("Create reservation: form → Godkend → receipt", () => {
    mockFbsReservations([])

    cy.intercept("POST", "/api/reservation", {
      statusCode: 200,
      body: {
        result: {
          status: "success",
          recordId: RECORD_ID,
          reservationId: 999111,
          pickupBranchId: PICKUP_BRANCH_ID,
          numberInQueue: 3,
        },
      },
    }).as("createReservation")

    visitPhysicalWork()
    cy.dataCy("work-page-button-logged-in").contains("Reserver bog").click()
    cy.dataCy("reservation-modal").should("be.visible")
    cy.dataCy("approve-reservation-button").click()
    cy.wait("@createReservation")

    cy.dataCy("reservation-receipt-queue-position").should("contain", "3")
    cy.dataCy("reservation-receipt-pickup-branch").should("contain", "Hovedbiblioteket")
    cy.contains("er nu reserveret til dig").should("be.visible")
  })

  it("Create reservation: failure → error body with reason-specific copy", () => {
    mockFbsReservations([])

    cy.intercept("POST", "/api/reservation", {
      statusCode: 200,
      body: {
        result: {
          status: "failed",
          recordId: RECORD_ID,
          reason: "already_reserved",
        },
      },
    }).as("createReservation")

    visitPhysicalWork()
    cy.dataCy("work-page-button-logged-in").contains("Reserver bog").click()
    cy.dataCy("reservation-modal").should("be.visible")
    cy.dataCy("approve-reservation-button").click()
    cy.wait("@createReservation")

    cy.dataCy("reservation-error")
      .should("be.visible")
      .and("have.attr", "data-reason", "already_reserved")
    cy.contains("Du har allerede reserveret denne bog.").should("be.visible")
    cy.contains("button", /^Luk$/).should("be.visible")
  })

  it("Reservation form shows missing-email copy when patron has no email", () => {
    mockFbsPatron({ emailAddress: null })
    mockFbsReservations([])

    visitPhysicalWork()
    cy.dataCy("work-page-button-logged-in").contains("Reserver bog").click()
    cy.dataCy("reservation-modal").should("be.visible")
    cy.contains("Du får ikke en e-mail").should("be.visible")
    cy.contains("Du får en sms når du kan hente bogen").should("be.visible")
    cy.contains("voksen-hjemmesiden")
      .should("have.attr", "href")
      .and("match", /\/user\/me$/)
  })

  it("Delete reservation: button swap → confirm → receipt", () => {
    mockFbsReservations([
      {
        reservationId: 999222,
        recordId: RECORD_ID,
        pickupBranch: PICKUP_BRANCH_ID,
        numberInQueue: 1,
        state: "reserved",
      },
    ])

    cy.intercept("DELETE", "/api/reservation/999222", {
      statusCode: 200,
      body: { ok: true },
    }).as("deleteReservation")

    visitPhysicalWork()

    cy.dataCy("delete-reservation-button").should("be.visible").click()
    cy.dataCy("delete-reservation-modal").should("be.visible")
    cy.contains("Vil du slette din reservering?").should("be.visible")

    // Re-register reservations endpoint to return empty so the receipt step
    // derives from absence after the delete.
    mockFbsReservations([])

    cy.dataCy("approve-delete-reservation-button").click()
    cy.wait("@deleteReservation")
    cy.contains("Din reservering er nu slettet").should("be.visible")
  })
})
