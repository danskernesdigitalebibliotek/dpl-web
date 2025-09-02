import getV1UserLoansAdapterFactory, { loanFactory } from "../factories/ap/getV1UserLoansAdapter"
import complexSearchForWorkTeaser from "../factories/fbi/complexSearchForWorkTeaser"
import { worksWithIdentifiersFactory } from "../factories/fbi/factory-parts/works"
import getMaterial from "../factories/fbi/getMaterial"
import configuration from "../factories/unilogin/configuration"
import createloan from "../factories/unilogin/createloan"
import institution from "../factories/unilogin/institution"
import introspection from "../factories/unilogin/introspection"
import tokenSet from "../factories/unilogin/tokenSet"
import userinfo from "../factories/unilogin/userinfo"
import { mockFrontpage, mockUniloginProfilePage } from "../support/mocks"

describe("Create loan UI Tests", () => {
  beforeEach(() => {
    mockFrontpage()

    cy.visit("/")
  })

  it("Navigate to material page ", () => {
    cy.interceptGraphql({
      operationName: "getMaterial",
      data: getMaterial.build(),
    })

    cy.visit("/work/work-of%3A870970-basis%3A136817027")
  })

  it("Navigate to loanable digital material and preview a loan", () => {
    cy.interceptGraphql({
      operationName: "getMaterial",
      data: getMaterial.build(),
    })

    cy.visit("/work/work-of%3A870970-basis%3A136817027")

    // Click the second slide select option
    cy.get("[data-cy='slide-select-option']").eq(1).click()

    // Find the try ebook button using its text
    cy.contains("Prøv e-bog").click()

    // Check if user is on the ebook preview page
    cy.url().should("include", "/work/work-of%3A870970-basis%3A136817027/read")
  })

  it("Navigate to loanable digital material and make a loan with unilogin user", () => {
    cy.interceptGraphql({
      operationName: "getMaterial",
      data: getMaterial.build(),
    })

    cy.visit("/work/work-of%3A870970-basis%3A136817027")

    // Click the second slide select option
    cy.get("[data-cy='slide-select-option']").eq(1).click()

    // Find the loan ebook button using its text
    cy.contains("Lån e-bog").click()

    const mockedCallbackUrl =
      "/auth/callback/unilogin?session_state=60cda845-402f-4085-b41d-3e4e773e04d4&code=3a6c3675-8ec8-472f-bcd5-9425be472d6d.60cda845-402f-4085-b41d-3e4e773e04d4.135f0ca5-6083-4b5c-9de6-d4a1b3f8d60c"

    cy.mockServerRest({
      method: "GET",
      path: "/.well-known/openid-configuration",
      data: configuration.build(),
    })

    cy.mockServerRest({
      method: "POST",
      path: "/token",
      data: tokenSet.build(),
    })

    cy.mockServerRest({
      method: "POST",
      path: "/introspect",
      data: introspection.build(),
    })

    cy.mockServerRest({
      method: "GET",
      path: "/userinfo",
      data: userinfo.build(),
    })

    cy.mockServerSoap({
      path: "/institution",
      data: institution,
    })

    cy.visit(mockedCallbackUrl)

    cy.intercept("GET", "/pubhub/v1/user/loans", {
      statusCode: 200,
      body: getV1UserLoansAdapterFactory.build({ loans: [] }),
      headers: { "content-type": "application/json" },
    })

    mockUniloginProfilePage()

    cy.dataCy("loan-slider-work").should("have.length", 0)

    cy.wait(1000)

    // Return to material page
    cy.visit("/work/work-of%3A800010-katalog%3A99122258315905763?type=EBOOKS")

    // Mock SOAP create loan call on unilogin client side
    cy.mockServerSoap({
      path: "/createloan",
      data: createloan,
    })

    cy.wait(1000)

    // Find the loan ebook button using its text
    cy.contains("Lån e-bog").click()

    // Approve the loan in the approve loan modal
    cy.get("[data-cy='approve-loan-button']").click()

    cy.intercept("GET", "/pubhub/v1/user/loans", {
      statusCode: 200,
      body: getV1UserLoansAdapterFactory.build({
        loans: [
          loanFactory.build({
            orderId: "757a22ed-cbc4-4659-a5a9-be39bfc2ba6c",
            libraryBook: {
              identifier: "9788711668016",
            },
          }),
        ],
      }),
      headers: { "content-type": "application/json" },
    })

    // Find the loan ebook button using its text
    cy.contains("Læs e-bog")

    const identifiers = ["9788711668016"]

    // Mock GraphQL response for complex search
    cy.interceptGraphql({
      operationName: "complexSearchForWorkTeaser",
      data: complexSearchForWorkTeaser.build({
        complexSearch: {
          hitcount: identifiers.length,
          works: worksWithIdentifiersFactory.transient({ identifiers }).build(),
        },
      }),
    })

    // Go to profile page
    cy.visit("/user/profile")

    // Assert that the loan slider contains the expected number of works
    cy.dataCy("loan-slider-work").should("have.length", 1).contains
  })
})
