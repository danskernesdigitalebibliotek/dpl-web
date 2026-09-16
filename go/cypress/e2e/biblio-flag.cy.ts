import getV1UserLoansAdapterFactory from "../factories/ap/getV1UserLoansAdapter"
import getAdgangsplatformenUserToken from "../factories/dpl-cms/getAdgangsplatformenUserToken"
import { biblioEnabledConfig } from "../factories/dpl-cms/getDplCmsPublicConfiguration"
import getMaterial from "../factories/fbi/getMaterial"
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
  // Biblio loans, wire shape (mapped by the service layer). Only fires for
  // Adgangsplatformen sessions — the hooks are patron-gated.
  cy.intercept("GET", /\/ap-service\/biblio\/v1\/loans(\?.*)?$/, {
    statusCode: 200,
    body: { loans: [], pagination: {} },
    headers: { "content-type": "application/json" },
  })
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
  if (type === "adgangsplatformen") {
    // See work-page-modal-flows.cy.ts for why both of these are needed.
    cy.setCookie("SSESS_dpl_cms", "test-drupal-session")
    cy.mockServerGraphQLQuery({
      operationName: "getAdgangsplatformenUserToken",
      data: getAdgangsplatformenUserToken.build(),
    })
  }
}

// With the Biblio adapter switched on, new digital loans belong to the
// adapter alone: anonymous preview is gone (WeDoBooks answers samples for
// signed-in patrons only, no Publizon fallback) and Unilogin — which the
// adapter cannot authenticate — gets a friendly error instead of a request
// that cannot succeed. The flag arrives through goConfiguration.public.biblio
// and is only active when flag, base url and SDK keys are all present.
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
    it("E-book → no preview button; the loan button still leads to login", () => {
      visitWork("EBOOK")
      cy.contains("button, a", "Lån e-bog").should("be.visible")
      cy.contains("button, a", "Prøv e-bog").should("not.exist")
    })

    it("Audiobook → no preview button", () => {
      visitWork("AUDIO_BOOK_ONLINE")
      cy.contains("button, a", "Lån lydbog").should("be.visible")
      cy.contains("button, a", "Prøv lydbog").should("not.exist")
    })
  })

  describe("Logged in via Unilogin", () => {
    beforeEach(() => {
      setSessionType("unilogin")
      mockEmptyLoans()
    })

    it("E-book → loan attempt is answered with the Unilogin error", () => {
      visitWork("EBOOK")
      cy.dataCy("work-page-button-logged-in").contains("Lån e-bog").click()
      cy.dataCy("loan-material-modal").should("be.visible")
      cy.dataCy("approve-loan-button").click()
      cy.contains("logget ind med Unilogin").should("be.visible")
    })

    it("E-book → preview attempt is answered with the same error", () => {
      visitWork("EBOOK")
      cy.dataCy("work-page-button-logged-in").contains("Prøv e-bog").click()
      cy.contains("logget ind med Unilogin").should("be.visible")
      // No navigation to the read page happened.
      cy.url().should("not.include", "/read")
    })

    it("Audiobook → preview attempt is answered with the same error", () => {
      visitWork("AUDIO_BOOK_ONLINE")
      cy.dataCy("work-page-button-logged-in").contains("Prøv lydbog").click()
      cy.contains("logget ind med Unilogin").should("be.visible")
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
