import getV1UserLoansAdapterFactory from "../factories/ap/getV1UserLoansAdapter"
import getAdgangsplatformenUserToken from "../factories/dpl-cms/getAdgangsplatformenUserToken"
import { eBookManifestationFactory } from "../factories/fbi/factory-parts/manifestations"
import { EBookFactory } from "../factories/fbi/factory-parts/works"
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

const mockFbsLoans = (loans: unknown[]) => {
  cy.mockServerRest({
    method: "GET",
    path: "/external/agencyid/patrons/patronid/loans/v2",
    data: loans,
  })
}

// The FBI record lookup the patron shelf uses to pair FBS records with
// works, resolving the fixture work for the reserved BOOK manifestation.
const mockManifestationsByFaust = () => {
  const manifestation = eBookManifestationFactory.build({
    pid: `870970-basis:${RECORD_ID}`,
    materialTypes: [
      {
        materialTypeGeneral: { display: "bøger", code: "BOOKS" },
        materialTypeSpecific: { code: "BOOK", display: "bog" },
      },
    ],
  })
  const work = EBookFactory.build({
    workId: `work-of:870970-basis:${RECORD_ID}`,
    manifestations: { all: [manifestation], bestRepresentation: manifestation },
  })
  cy.interceptGraphql({
    operationName: "getManifestationsByFaust",
    data: {
      manifestations: [
        { pid: manifestation.pid, audience: { childrenOrAdults: [] }, ownerWork: work },
      ],
    },
  })
}

const mockBranches = () => {
  // Branch lookup runs entirely server-side via the getBranchTitle server
  // action, so only the server-side (MSW) GraphQL mock is needed.
  cy.mockServerGraphQLQuery({
    operationName: "getBranches",
    data: { getBranches: [{ isilId: PICKUP_BRANCH_ID, title: "Hovedbiblioteket" }] },
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

  it("Create reservation: failure → error toast with reason-specific copy", () => {
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

    cy.get('[data-sonner-toast][data-type="error"]')
      .should("exist")
      .and("contain", "Du har allerede reserveret denne bog.")
    // The modal stays on the form step so the user can retry.
    cy.dataCy("approve-reservation-button").should("exist")
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

  it("Delete reservation: details → confirm → receipt", () => {
    mockFbsPatron()
    mockFbsLoans([])
    mockFbsReservations([
      {
        reservationId: 999222,
        recordId: RECORD_ID,
        pickupBranch: PICKUP_BRANCH_ID,
        numberInQueue: 1,
        state: "reserved",
      },
    ])
    mockManifestationsByFaust()

    cy.mockServerRest({
      method: "DELETE",
      path: "/external/v1/agencyid/patrons/patronid/reservations",
      data: { ok: true },
    })

    visitPhysicalWork()

    // The reserved state swaps the CTA to "Se reservering", which opens
    // the details view with the delete action in the footer.
    cy.dataCy("view-reservation-button").should("be.visible").click()
    cy.dataCy("reservation-details").should("exist")

    // The button stays disabled until the shelf has resolved the reservation;
    // the retried assertion waits that window out. AnimateChangeInHeight
    // remounts on transition; the button can detach between query and click.
    // `{force: true}` skips the actionability retry that races with the
    // remount.
    cy.dataCy("delete-reservation-button").should("be.visible").and("be.enabled")
    cy.dataCy("delete-reservation-button").click({ force: true })
    cy.dataCy("delete-reservation-modal").should("exist")
    cy.dataCy("delete-reservation-modal").should("contain", "Vil du slette din reservering?")

    // Re-register reservations endpoint to return empty so the refetch after
    // deletion reflects the reservation being gone.
    mockFbsReservations([])

    cy.dataCy("approve-delete-reservation-button").click({ force: true })
    cy.dataCy("delete-reservation-receipt").should("contain", "Din reservering er nu slettet")
  })
})
