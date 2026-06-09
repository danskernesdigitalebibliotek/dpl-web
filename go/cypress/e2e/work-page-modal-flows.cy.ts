import getV1UserLoansAdapterFactory from "../factories/ap/getV1UserLoansAdapter"
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
  // Mock both and alias them so `cy.wait("@loans")` can gate clicks until the
  // logged-in buttons (which render after isLoadingLoans flips false) appear.
  cy.intercept("GET", "/pubhub/v1/user/loans*", {
    statusCode: 200,
    body: getV1UserLoansAdapterFactory.build({ loans: [] }),
    headers: { "content-type": "application/json" },
  }).as("loansUnilogin")
  cy.intercept("GET", "/ap-service/pubhub-adapter/v1/user/loans*", {
    statusCode: 200,
    body: getV1UserLoansAdapterFactory.build({ loans: [] }),
    headers: { "content-type": "application/json" },
  }).as("loansAdgangsplatformen")
}

const setSessionType = (type: "unilogin" | "adgangsplatformen") => {
  // createGoSession only sets the `go-session` cookie; the publizon adapter
  // picker reads `go-session:type` separately, so set it explicitly.
  cy.createGoSession({ type })
  cy.setCookie("go-session:type", type)
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
      cy.wait("@loansUnilogin")
      cy.contains("Reservér bog").click()
      cy.dataCy("reservation-unilogin-modal").should("be.visible")
      cy.url().should("include", "modal=ReservationUniloginModal")
    })

    it("E-book → LoanMaterialModal", () => {
      visitWork("EBOOK")
      cy.wait("@loansUnilogin")
      cy.contains("Lån e-bog").click()
      cy.dataCy("loan-material-modal").should("be.visible")
      cy.url().should("include", "modal=LoanMaterialModal")
    })

    it("Audiobook → LoanMaterialModal", () => {
      visitWork("AUDIO_BOOK_ONLINE")
      cy.wait("@loansUnilogin")
      cy.contains("Lån lydbog").click()
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
      cy.wait("@loansAdgangsplatformen")
      cy.contains("Reservér bog").click()
      cy.dataCy("reservation-modal").should("be.visible")
      cy.url().should("include", "modal=ReservationModal")
    })

    it("E-book → LoanMaterialModal", () => {
      visitWork("EBOOK")
      cy.wait("@loansAdgangsplatformen")
      cy.contains("Lån e-bog").click()
      cy.dataCy("loan-material-modal").should("be.visible")
      cy.url().should("include", "modal=LoanMaterialModal")
    })

    it("Audiobook → LoanMaterialModal", () => {
      visitWork("AUDIO_BOOK_ONLINE")
      cy.wait("@loansAdgangsplatformen")
      cy.contains("Lån lydbog").click()
      cy.dataCy("loan-material-modal").should("be.visible")
      cy.url().should("include", "modal=LoanMaterialModal")
    })
  })
})
