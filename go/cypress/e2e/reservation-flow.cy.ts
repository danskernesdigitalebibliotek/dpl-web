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
  // Branch lookup runs entirely server-side via the getBranchTitle server
  // action, so only the server-side (MSW) GraphQL mock is needed.
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
    // mockFbsPatron is registered per-test so tests that need a non-default
    // patron (e.g. missing-email) can register their override first — mockttp
    // matches rules in registration order, first match wins.
    mockFbsHoldings()
    mockBranches()
  })

  it("Create reservation: form → Godkend → receipt", () => {
    mockFbsPatron()
    mockFbsReservations([])

    // Client calls the service-layer hook which fetches via the AP-service proxy
    // to mockttp. Mock at the FBS layer with the raw FBS response shape — the
    // mapper translates to our domain CreateReservationResult.
    cy.mockServerRest({
      method: "POST",
      path: "/external/v1/agencyid/patrons/patronid/reservations/v2",
      data: {
        success: true,
        reservationResults: [
          {
            recordId: RECORD_ID,
            result: "reserved",
            reservationDetails: {
              reservationId: 999111,
              pickupBranch: PICKUP_BRANCH_ID,
              numberInQueue: 3,
            },
          },
        ],
      },
    })

    visitPhysicalWork()
    cy.dataCy("work-page-button-logged-in").contains("Reserver bog").click()
    cy.dataCy("reservation-modal").should("be.visible")
    cy.dataCy("approve-reservation-button").click()

    // Inside a vaul drawer (mobile viewport) Cypress's visibility check trips on
    // the overlay sibling; `should("exist")` + `contain` is enough to assert the
    // swap happened.
    cy.dataCy("reservation-receipt").should("exist")
    cy.dataCy("reservation-receipt-queue-position").should("contain", "3")
    cy.dataCy("reservation-receipt-pickup-branch").should("contain", "Hovedbiblioteket")
    cy.dataCy("reservation-receipt").should("contain", "er nu reserveret til dig")
  })

  it("Create reservation: failure → error body with reason-specific copy", () => {
    mockFbsPatron()
    mockFbsReservations([])

    cy.mockServerRest({
      method: "POST",
      path: "/external/v1/agencyid/patrons/patronid/reservations/v2",
      data: {
        success: false,
        reservationResults: [{ recordId: RECORD_ID, result: "already_reserved" }],
      },
    })

    visitPhysicalWork()
    cy.dataCy("work-page-button-logged-in").contains("Reserver bog").click()
    cy.dataCy("reservation-modal").should("be.visible")
    cy.dataCy("approve-reservation-button").click()

    cy.dataCy("reservation-error")
      .should("exist")
      .and("have.attr", "data-reason", "already_reserved")
      .and("contain", "Du har allerede reserveret denne bog.")
    cy.contains("button", /^Luk$/).should("exist")
  })

  it("Reservation form shows missing-email copy when patron has no email", () => {
    mockFbsPatron({ emailAddress: null })
    mockFbsReservations([])

    visitPhysicalWork()
    cy.dataCy("work-page-button-logged-in").contains("Reserver bog").click()
    cy.dataCy("reservation-modal").should("exist")
    cy.dataCy("reservation-modal").should("contain", "Du får ikke en e-mail")
    cy.dataCy("reservation-modal")
      .find("a")
      .contains("voksen-hjemmesiden")
      .should("have.attr", "href")
      .and("match", /\/user\/me$/)
  })

  it("Delete reservation: button swap → confirm → receipt", () => {
    mockFbsPatron()
    mockFbsReservations([
      {
        reservationId: 999222,
        recordId: RECORD_ID,
        pickupBranch: PICKUP_BRANCH_ID,
        numberInQueue: 1,
        state: "reserved",
      },
    ])

    cy.mockServerRest({
      method: "DELETE",
      path: "/external/v1/agencyid/patrons/patronid/reservations",
      data: { ok: true },
    })

    visitPhysicalWork()

    cy.dataCy("delete-reservation-button").should("be.visible").click()
    cy.dataCy("delete-reservation-modal").should("exist")
    cy.dataCy("delete-reservation-modal").should("contain", "Vil du slette din reservering?")

    // Re-register reservations endpoint to return empty so the receipt step
    // derives from absence after the delete.
    mockFbsReservations([])

    // AnimateChangeInHeight remounts on transition; the button can detach
    // between query and click. `{force: true}` skips the actionability retry
    // that races with the remount.
    cy.dataCy("approve-delete-reservation-button").click({ force: true })
    // data-cy swaps from delete-reservation-modal to delete-reservation-receipt
    // once the reservation is gone from cache.
    cy.dataCy("delete-reservation-receipt").should("contain", "Din reservering er nu slettet")
  })
})
