import getV1UserLoansAdapterFactory from "../factories/ap/getV1UserLoansAdapter"
import getAdgangsplatformenUserToken from "../factories/dpl-cms/getAdgangsplatformenUserToken"
import getMaterial from "../factories/fbi/getMaterial"
import { mockFrontpage } from "../support/mocks"

const WORK_URL = "/work/work-of%3A870970-basis%3A136817027"

const visitWork = (type: "BOOK" | "EBOOK" | "AUDIO_BOOK_ONLINE") => {
  cy.interceptGraphql({
    operationName: "getMaterial",
    data: getMaterial.build(),
  })
  cy.visit(`${WORK_URL}?type=${type}`)
}

const mockEmptyLoans = () => {
  // `useGetV1UserLoans` swaps adapters based on the `go-session:type` cookie:
  //   unilogin → /pubhub/v1/user/loans (local adapter)
  //   anything else → /ap-service/pubhub-adapter/v1/user/loans
  // Mock both with a single regex so we don't care which fires.
  cy.intercept("GET", /\/(pubhub|ap-service\/pubhub-adapter)\/v1\/user\/loans(\?.*)?$/, {
    statusCode: 200,
    body: getV1UserLoansAdapterFactory.build({ loans: [] }),
    headers: { "content-type": "application/json" },
  })
}

const setSessionType = (type: "unilogin" | "adgangsplatformen") => {
  // createGoSession only sets the `go-session` cookie; the publizon adapter
  // picker reads `go-session:type` separately, so set it explicitly.
  cy.createGoSession({ type })
  cy.setCookie("go-session:type", type)
  // The middleware destroys adgangsplatformen sessions that lack a DPL CMS
  // session cookie (proxy.ts → getDplCmsSessionCookie). Without this the
  // session is wiped before the work page renders and the LoggedIn buttons
  // never mount. Any SSESS-prefixed cookie satisfies the check.
  if (type === "adgangsplatformen") {
    cy.setCookie("SSESS_dpl_cms", "test-drupal-session")
    // The same SSESS cookie makes `userIsLoggedInAtDplCms` return true, which
    // can lead proxy.ts to call `loadUserToken` between tests. Without a mock
    // that DPL CMS query falls through to the catch arm and noisily fails,
    // and the resulting save-session work has been observed to delay the next
    // page load past Cypress's 15s data-cy timeout. Stub it so the refresh
    // path completes quickly when triggered.
    cy.mockServerGraphQLQuery({
      operationName: "getAdgangsplatformenUserToken",
      data: getAdgangsplatformenUserToken.build(),
    })
  }
}

// Click a button inside the logged-in WorkPageButtons block. Only LoggedIn
// WorkPageButton instances carry `work-page-button-logged-in`, so scoping to
// it guarantees we wait for the logged-in branch to mount before resolving
// `.contains(label)` — even though LoggedOut renders an identically-labelled
// button immediately on page load.
const clickLoggedInButton = (label: string) => {
  cy.dataCy("work-page-button-logged-in").contains(label).click()
}

describe("Work page → modal shown for each (material × login state)", () => {
  beforeEach(() => {
    mockFrontpage()

    // Dev throws the readable message, CI throws the minified one — suppress both.
    cy.expectError("useMediaQuery is a client-only hook")
    cy.expectError("Minified React error #419")

    cy.visit("/")
  })

  describe("Logged out", () => {
    it("Physical book → ReservationLoginModal", () => {
      visitWork("BOOK")
      cy.contains("Reservér bog").click()
      cy.dataCy("reservation-login-modal").should("be.visible")
      cy.url().should("include", "modal=ReservationLoginModal")
    })

    it("E-book → LoanLoginModal", () => {
      visitWork("EBOOK")
      cy.contains("Lån e-bog").click()
      cy.dataCy("loan-login-modal").should("be.visible")
      cy.url().should("include", "modal=LoanLoginModal")
    })

    it("Audiobook → LoanLoginModal", () => {
      visitWork("AUDIO_BOOK_ONLINE")
      cy.contains("Lån lydbog").click()
      cy.dataCy("loan-login-modal").should("be.visible")
      cy.url().should("include", "modal=LoanLoginModal")
    })
  })

  describe("Logged in via UNI•Login", () => {
    beforeEach(() => {
      setSessionType("unilogin")
      mockEmptyLoans()
    })

    it("Physical book → ReservationUniloginModal (UNI•Login cannot reserve physical)", () => {
      visitWork("BOOK")
      clickLoggedInButton("Reservér bog")
      cy.dataCy("reservation-unilogin-modal").should("be.visible")
      cy.url().should("include", "modal=ReservationUniloginModal")
    })

    it("E-book → LoanMaterialModal", () => {
      visitWork("EBOOK")
      clickLoggedInButton("Lån e-bog")
      cy.dataCy("loan-material-modal").should("be.visible")
      cy.url().should("include", "modal=LoanMaterialModal")
    })

    it("Audiobook → LoanMaterialModal", () => {
      visitWork("AUDIO_BOOK_ONLINE")
      clickLoggedInButton("Lån lydbog")
      cy.dataCy("loan-material-modal").should("be.visible")
      cy.url().should("include", "modal=LoanMaterialModal")
    })
  })

  describe("Logged in via Adgangsplatformen", () => {
    beforeEach(() => {
      setSessionType("adgangsplatformen")
      mockEmptyLoans()
    })

    it("Physical book → ReservationModal", () => {
      visitWork("BOOK")
      clickLoggedInButton("Reservér bog")
      cy.dataCy("reservation-modal").should("be.visible")
      cy.url().should("include", "modal=ReservationModal")
    })

    it("E-book → LoanMaterialModal", () => {
      visitWork("EBOOK")
      clickLoggedInButton("Lån e-bog")
      cy.dataCy("loan-material-modal").should("be.visible")
      cy.url().should("include", "modal=LoanMaterialModal")
    })

    it("Audiobook → LoanMaterialModal", () => {
      visitWork("AUDIO_BOOK_ONLINE")
      clickLoggedInButton("Lån lydbog")
      cy.dataCy("loan-material-modal").should("be.visible")
      cy.url().should("include", "modal=LoanMaterialModal")
    })
  })
})
