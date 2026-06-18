import getV1UserLoansAdapterFactory from "../factories/ap/getV1UserLoansAdapter"
import getAdgangsplatformenUserToken from "../factories/dpl-cms/getAdgangsplatformenUserToken"
import getMaterial from "../factories/fbi/getMaterial"
import { mockFrontpage } from "../support/mocks"

const WORK_URL = "/work/work-of%3A870970-basis%3A136817027"
// Identifier extracted from the EBOOK manifestation in the getMaterial fixture
// (pid: "870970-basis:52380235", PUBLIZON/ISBN: "9788711668016").
const EBOOK_IDENTIFIER = "9788711668016"

const setupAdgangsplatformenSession = () => {
  cy.createGoSession({ type: "adgangsplatformen" })
  cy.setCookie("go-session:type", "adgangsplatformen")
  cy.setCookie("SSESS_dpl_cms", "test-drupal-session")
  cy.mockServerGraphQLQuery({
    operationName: "getAdgangsplatformenUserToken",
    data: getAdgangsplatformenUserToken.build(),
  })
}

const mockUserLoans = (identifiers: string[] = []) => {
  cy.intercept("GET", /\/(pubhub|ap-service\/pubhub-adapter)\/v1\/user\/loans(\?.*)?$/, {
    statusCode: 200,
    body: getV1UserLoansAdapterFactory.build({}, { transient: { identifiers } }),
    headers: { "content-type": "application/json" },
  })
}

const visitEbook = () => {
  cy.interceptGraphql({
    operationName: "getMaterial",
    data: getMaterial.build(),
  })
  cy.visit(`${WORK_URL}?type=EBOOK`)
}

describe("Loan material flow", () => {
  beforeEach(() => {
    mockFrontpage()
    cy.expectError("useMediaQuery is a client-only hook")
    cy.expectError("Minified React error #419")

    setupAdgangsplatformenSession()
  })

  it("Confirm prompt: clicking Ja triggers POST and closes modal", () => {
    mockUserLoans([])

    cy.intercept("POST", new RegExp(`/v1/user/loans/${EBOOK_IDENTIFIER}(\\?.*)?$`), {
      statusCode: 200,
      body: {},
    }).as("createLoan")

    visitEbook()
    cy.dataCy("work-page-button-logged-in").contains("Lån e-bog").click()
    cy.dataCy("loan-material-modal").should("be.visible")
    cy.contains("Er du sikker på, at du vil låne").should("be.visible")

    cy.dataCy("approve-loan-button").click()
    cy.wait("@createLoan")
    cy.dataCy("loan-material-modal").should("not.exist")
  })

  it("Already loaned: modal swaps to LoanAlreadyLoanedContent (no Ja button)", () => {
    // When the loan exists at page load the work-page button label becomes
    // "Læs e-bog" (no Lån button to click). Open the modal directly via the
    // nuqs-encoded URL so we still exercise the already-loaned content path.
    mockUserLoans([EBOOK_IDENTIFIER])
    cy.interceptGraphql({ operationName: "getMaterial", data: getMaterial.build() })

    const workId = "work-of:870970-basis:136817027"
    const pid = "870970-basis:52380235"
    const modalProps = encodeURIComponent(JSON.stringify({ wid: workId, pid }))
    cy.visit(`${WORK_URL}?type=EBOOK&modal=LoanMaterialModal&modalProps=${modalProps}`)

    cy.dataCy("loan-already-loaned").should("be.visible")
    cy.contains("Du har allerede lånt denne").should("be.visible")
    cy.contains("Find den på Min side.").should("be.visible")
    cy.dataCy("approve-loan-button").should("not.exist")
    cy.contains("button", /^Luk$/).should("be.visible")
  })

  it("Loan failure: swaps to LoanErrorContent with the code-specific copy", () => {
    mockUserLoans([])

    cy.intercept("POST", new RegExp(`/v1/user/loans/${EBOOK_IDENTIFIER}(\\?.*)?$`), {
      statusCode: 400,
      body: { code: 105, message: "unavailable" },
    }).as("createLoan")

    visitEbook()
    cy.dataCy("work-page-button-logged-in").contains("Lån e-bog").click()
    cy.dataCy("approve-loan-button").click()
    cy.wait("@createLoan")

    cy.dataCy("loan-error").should("be.visible").and("have.attr", "data-code", "105")
    cy.contains("Bogen er desværre ikke tilgængelig for udlån lige nu (#105)").should("be.visible")
    cy.contains("button", /^Luk$/).should("be.visible")
  })
})
