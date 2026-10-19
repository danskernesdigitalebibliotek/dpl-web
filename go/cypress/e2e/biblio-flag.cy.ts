import getV1UserLoansAdapterFactory from "../factories/ap/getV1UserLoansAdapter"
import getAdgangsplatformenUserToken from "../factories/dpl-cms/getAdgangsplatformenUserToken"
import { biblioEnabledConfig } from "../factories/dpl-cms/getDplCmsPublicConfiguration"
import getMaterial from "../factories/fbi/getMaterial"
import UniloginUserinfo from "../factories/unilogin/userinfo"
import { mockConfig, mockFrontpage } from "../support/mocks"

const WORK_URL = "/work/work-of%3A870970-basis%3A136817027"

const visitWork = (type: "EBOOK" | "AUDIO_BOOK_ONLINE") => {
  cy.interceptGraphql({
    operationName: "getMaterial",
    data: getMaterial.build(),
  })
  cy.visit(`${WORK_URL}?type=${type}`)
}

const mockEmptyLoans = () => {
  // Publizon loans — see work-page-modal-flows.cy.ts for the adapter split.
  cy.intercept("GET", /\/(pubhub|ap-service\/pubhub-adapter)\/v1\/user\/loans(\?.*)?$/, {
    statusCode: 200,
    body: getV1UserLoansAdapterFactory.build({ loans: [] }),
    headers: { "content-type": "application/json" },
  })
  // Biblio loans, wire shape (mapped by the service layer). Fires for a
  // patron or a Unilogin session — the digital hooks are open to both.
  cy.intercept("GET", /\/ap-service\/biblio\/v1\/loans(\?.*)?$/, {
    statusCode: 200,
    body: { loans: [], pagination: {} },
    headers: { "content-type": "application/json" },
  })
}

// A successful Biblio adapter loan creation, in the adapter's wire shape
// (mapped by the service layer). The modal keys success off `loan`, so the
// material and dates only need to parse.
const mockBiblioLoanCreated = () => {
  cy.intercept("POST", /\/ap-service\/biblio\/v1\/loans(\?.*)?$/, {
    statusCode: 201,
    body: {
      status: "loanable",
      loan: {
        id: "biblio-loan-1",
        material_id: "9788711668016",
        material_type: "ebook",
        start: "2026-08-01T10:00:00Z",
        end: "2026-08-31T10:00:00Z",
        active: true,
        title: "En bog",
        author: "Christie, Agatha",
        publisher: "Forlag",
        publish_date: "2014-11-07T00:00:00Z",
        license: { type: "selection" },
      },
    },
    headers: { "content-type": "application/json" },
  }).as("createBiblioLoan")
}

// The server caches goConfiguration ("use cache", tagged dpl-cms-config), so
// a spec that changes the mocked configuration must drop the cached entry
// before visiting — otherwise the previous spec's config wins for 15 minutes.
const revalidateCmsConfig = () => {
  cy.request(
    `/cache/revalidate?tags=dpl-cms-config&secret=${Cypress.env("DRUPAL_REVALIDATE_SECRET")}`
  )
}

const setSessionType = (type: "unilogin" | "adgangsplatformen") => {
  cy.createGoSession({ type })
  cy.setCookie("go-session:type", type)
  // See work-page-modal-flows.cy.ts for why both of these are needed. Both
  // session types live on the Drupal session, so both need them.
  cy.setCookie("SSESS_dpl_cms", "test-drupal-session")
  cy.mockServerGraphQLQuery({
    operationName: "getAdgangsplatformenUserToken",
    data: getAdgangsplatformenUserToken.build(
      type === "unilogin"
        ? { dplTokens: { adgangsplatformen: { user: { type: "unilogin_user" } } } }
        : {}
    ),
  })
  if (type === "unilogin") {
    // If the middleware finds no logged-in session, it logs the student in
    // from the token, which reads the Unilogin userinfo.
    cy.mockServerRest({
      method: "GET",
      path: "/userinfo",
      data: UniloginUserinfo.build(),
    })
  }
}

// With the Biblio adapter switched on, new digital loans belong to the
// adapter alone — for a patron and, since Unilogin runs through
// Adgangsplatformen (ADR-013), for a Unilogin user too, who loans with their
// own token. Sampling opens from a url without an SDK session, so the preview
// works for anonymous visitors as well. The flag arrives through
// goConfiguration.public.biblio and is only active when flag, base url and
// SDK keys are all present.
describe("Work page with the Biblio adapter switched on", () => {
  beforeEach(() => {
    // The global beforeEach (support/e2e.ts) has already registered the
    // default configuration, and the mock server answers with the FIRST
    // matching rule — start over so the flag-on configuration is the one
    // that serves.
    cy.resetServerMocks()
    mockConfig({ biblio: biblioEnabledConfig })
    mockFrontpage()
    revalidateCmsConfig()

    // Dev throws the readable message, CI throws the minified one — suppress both.
    cy.expectError("useMediaQuery is a client-only hook")
    cy.expectError("Minified React error #419")

    cy.visit("/")
  })

  describe("Anonymous", () => {
    it("E-book → the preview leads to the read page; the loan button still leads to login", () => {
      visitWork("EBOOK")
      cy.contains("button, a", "Lån e-bog").should("be.visible")
      cy.contains("a", "Prøv e-bog")
        .should("be.visible")
        .should("have.attr", "href")
        .and("include", "/read")
    })

    it("Audiobook → the preview button is available", () => {
      visitWork("AUDIO_BOOK_ONLINE")
      cy.contains("button, a", "Lån lydbog").should("be.visible")
      cy.contains("button", "Prøv lydbog").should("be.visible").should("be.enabled")
    })
  })

  describe("Logged in via Unilogin", () => {
    beforeEach(() => {
      setSessionType("unilogin")
      mockEmptyLoans()
    })

    it("E-book → the loan goes through the Biblio adapter", () => {
      // Unilogin now loans with its own Adgangsplatformen token (ADR-013), so
      // the attempt reaches the adapter instead of the old Unilogin error.
      mockBiblioLoanCreated()

      visitWork("EBOOK")
      cy.dataCy("work-page-button-logged-in").contains("Lån e-bog").click()
      cy.dataCy("loan-material-modal").should("be.visible")
      cy.dataCy("approve-loan-button").click()

      cy.wait("@createBiblioLoan")
      cy.contains("logget ind med Unilogin").should("not.exist")
      // A created loan advances to the "Dit lån" view with the read action.
      cy.dataCy("read-loan-button").should("be.visible")
    })

    it("E-book → the preview leads to the read page, no error", () => {
      visitWork("EBOOK")
      cy.dataCy("work-page-button-logged-in")
        .contains("Prøv e-bog")
        .should("be.visible")
        .should("have.attr", "href")
        .and("include", "/read")
      cy.contains("logget ind med Unilogin").should("not.exist")
    })

    it("Audiobook → the preview button is available, no error", () => {
      visitWork("AUDIO_BOOK_ONLINE")
      cy.dataCy("work-page-button-logged-in")
        .contains("Prøv lydbog")
        .should("be.visible")
        .should("be.enabled")
      cy.contains("logget ind med Unilogin").should("not.exist")
    })
  })

  describe("Logged in via Adgangsplatformen", () => {
    beforeEach(() => {
      setSessionType("adgangsplatformen")
      mockEmptyLoans()
    })

    it("E-book → the loan goes through the Biblio adapter", () => {
      // The patron path must keep working too: the digital hooks gate on
      // isDigitalLoanAuthenticated, which falls back to the patron flag, so a
      // regression that dropped the fallback would lock patrons out here.
      mockBiblioLoanCreated()

      visitWork("EBOOK")
      cy.dataCy("work-page-button-logged-in").contains("Lån e-bog").click()
      cy.dataCy("loan-material-modal").should("be.visible")
      cy.dataCy("approve-loan-button").click()

      cy.wait("@createBiblioLoan")
      // A created loan advances to the "Dit lån" view with the read action.
      cy.dataCy("read-loan-button").should("be.visible")
    })
  })
})

// The control group: with the flag off (the default config) the Publizon
// track is untouched — anonymous preview works as today.
describe("Work page with the Biblio adapter switched off", () => {
  beforeEach(() => {
    mockFrontpage()
    revalidateCmsConfig()

    cy.expectError("useMediaQuery is a client-only hook")
    cy.expectError("Minified React error #419")

    cy.visit("/")
  })

  it("Anonymous e-book → the Publizon preview button is still there", () => {
    visitWork("EBOOK")
    cy.contains("button, a", "Prøv e-bog").should("be.visible")
  })
})
