import routes from "@/lib/config/resolvers/routes"

import getV1LibraryProfileAdapterFactory from "../factories/ap/getV1LibraryProfileAdapter"
import getV1ProductsIdentifierAdapterFactory from "../factories/ap/getV1ProductsIdentifierAdapter"
import getV1UserLoansAdapterFactory from "../factories/ap/getV1UserLoansAdapter"
import getAdgangsplatformenUserToken from "../factories/dpl-cms/getAdgangsplatformenUserToken"
import complexSearchForWorkTeaser from "../factories/fbi/complexSearchForWorkTeaser"
import {
  audioBookManifestationIdentifierFactory,
  eBookManifestationIdentifierFactory,
  identifierFactory,
} from "../factories/fbi/factory-parts/identifier"
import {
  audioBookManifestationFactory,
  eBookManifestationFactory,
} from "../factories/fbi/factory-parts/manifestations"
import { AudioBookFactory, EBookFactory } from "../factories/fbi/factory-parts/works"
import configuration from "../factories/unilogin/configuration"
import institution from "../factories/unilogin/institution"
import introspection from "../factories/unilogin/introspection"
import tokenSet from "../factories/unilogin/tokenSet"
import userinfo from "../factories/unilogin/userinfo"
import { mockFrontpage } from "../support/mocks"

describe("Login / Logout UI Tests", () => {
  beforeEach(() => {
    // Visit search page and wait for client side render
    cy.visit("/search").contains("Ingen søgeord fundet")

    // Click profile button
    cy.dataCy("profile-button").click()

    // Check if login modal is open and visible
    cy.dataCy("global-sheet").should("be.visible")
  })

  it("Should open and close login modal", () => {
    // Opens login modal with beforeEach

    // Close login modal
    cy.dataCy("global-sheet-close-button").click()

    // Check if login modal is closed
    cy.dataCy("global-sheet").should("not.exist")
  })

  it("Should open unilogin page", () => {
    // Opens login modal with beforeEach

    const uniloginUrl = routes["routes.login.unilogin"]

    // Intercept unilogin callback page
    cy.intercept("GET", uniloginUrl, {
      statusCode: 200,
      body: "<html>I am login page</html>",
      headers: { "content-type": "text/html" },
    })

    // Click UNI•Login button
    cy.dataCy("login-sheet-unilogin-button").click()

    // Check if mocked unilogin page is open
    cy.location("pathname").should("eq", uniloginUrl)
  })

  it("Should open adgangsplatformen page", () => {
    // Opens login modal with beforeEach

    // Intercept mocked adgangsplatformen login page
    cy.intercept("GET", "/mocked/login*", {
      statusCode: 200,
      body: "<html>I am login page</html>",
      headers: { "content-type": "text/html" },
    })

    // Click adgangsplatformen button
    cy.dataCy("login-sheet-adgangsplatformen-button").click()

    // Check if mocked adgangsplatformen page is open
    cy.location("pathname").should("eq", "/mocked/login")
  })
})

describe("UNI•Login: Login / Logout API Tests", () => {
  const performLoginCallback = () => {
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
  }

  it("Should login when performing unilogin callback", () => {
    performLoginCallback()

    cy.location("pathname").should("eq", "/user/profile")
  })

  it("Should show loans on unilogin user profile page", () => {
    performLoginCallback()

    cy.intercept("GET", "/pubhub/v1/library/profile", {
      statusCode: 200,
      body: getV1LibraryProfileAdapterFactory.build(),
      headers: { "content-type": "application/json" },
    })

    const identifiers = identifierFactory.buildList(9)

    cy.intercept("GET", "/pubhub/v1/user/loans", {
      statusCode: 200,
      body: getV1UserLoansAdapterFactory.transient({ identifiers }).build(),
      headers: { "content-type": "application/json" },
    })

    const works = identifiers.map((identifier, index) => {
      if (index % 2 === 0) {
        return EBookFactory.build({
          manifestations: {
            all: [
              eBookManifestationFactory.build({
                identifiers: [eBookManifestationIdentifierFactory.build({ value: identifier })],
              }),
            ],
            bestRepresentation: eBookManifestationFactory.build({
              identifiers: [eBookManifestationIdentifierFactory.build({ value: identifier })],
            }),
          },
        })
      }

      return AudioBookFactory.build({
        manifestations: {
          all: [
            audioBookManifestationFactory.build({
              identifiers: [audioBookManifestationIdentifierFactory.build({ value: identifier })],
            }),
          ],
          bestRepresentation: audioBookManifestationFactory.build({
            identifiers: [audioBookManifestationIdentifierFactory.build({ value: identifier })],
          }),
        },
      })
    })

    cy.interceptGraphql({
      operationName: "complexSearchForWorkTeaser",
      data: complexSearchForWorkTeaser.build({
        complexSearch: {
          hitcount: identifiers.length,
          works,
        },
      }),
    })

    cy.intercept("GET", "/ap-service/pubhub-adapter/v1/products/*", reg => {
      // Intercept the request and respond with a mocked product
      const id = reg.url.split("/").pop() // Get the last part of the URL which is the product ID

      reg.reply({
        statusCode: 200,
        body: getV1ProductsIdentifierAdapterFactory.build({
          product: { externalProductId: { id }, costFree: true },
        }),
        headers: { "content-type": "application/json" },
      })
    })

    cy.dataCy("loan-slider").should("be.visible")
    cy.dataCy("loan-slider-next-button").click()
    cy.dataCy("loan-slider-prev-button").click()
    cy.dataCy("loan-slider-work").should("have.length", identifiers.length)
  })

  it("Should logout when clicking logout button", () => {
    performLoginCallback()

    cy.dataCy("logout-button").click()

    cy.location("pathname").should("eq", "/")
  })
})

describe("Adgangsplatformen: Login / Logout API Tests", () => {
  const performLoginCallback = () => {
    const mockedCallbackUrl = "/auth/callback/adgangsplatformen"

    //Set mocked session cookie
    cy.setCookie("SSESS", "cookie-value")

    cy.mockServerGraphQLQuery({
      operationName: "getAdgangsplatformenUserToken",
      data: getAdgangsplatformenUserToken.build(),
    })

    cy.interceptGraphql({
      operationName: "complexSearchForWorkTeaser",
      data: complexSearchForWorkTeaser.build(),
    })

    cy.visit(mockedCallbackUrl)
  }

  it("Should login when performing adgangsplatformen callback", () => {
    performLoginCallback()

    cy.location("pathname").should("eq", "/user/profile")
  })

  it("Should show loans on adgangsplatformen user profile page", () => {
    performLoginCallback()

    cy.intercept("GET", "/auth/session", {
      isLoggedIn: true,
      expires: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour from now
      user: {
        name: "Adgangsplatformen bruger",
      },
      type: "adgangsplatformen",
    })

    cy.intercept("GET", "ap-service/pubhub-adapter/v1/library/profile", {
      statusCode: 200,
      body: getV1LibraryProfileAdapterFactory.build(),
      headers: { "content-type": "application/json" },
    })

    const identifiers = identifierFactory.buildList(6)

    cy.intercept("GET", "/ap-service/pubhub-adapter/v1/user/loans", {
      statusCode: 200,
      body: getV1UserLoansAdapterFactory.transient({ identifiers }).build(),
      headers: { "content-type": "application/json" },
    })

    const works = identifiers.map((identifier, index) => {
      if (index % 2 === 0) {
        return EBookFactory.build({
          manifestations: {
            all: [
              eBookManifestationFactory.build({
                identifiers: [eBookManifestationIdentifierFactory.build({ value: identifier })],
              }),
            ],
            bestRepresentation: eBookManifestationFactory.build({
              identifiers: [eBookManifestationIdentifierFactory.build({ value: identifier })],
            }),
          },
        })
      }

      return AudioBookFactory.build({
        manifestations: {
          all: [
            audioBookManifestationFactory.build({
              identifiers: [audioBookManifestationIdentifierFactory.build({ value: identifier })],
            }),
          ],
          bestRepresentation: audioBookManifestationFactory.build({
            identifiers: [audioBookManifestationIdentifierFactory.build({ value: identifier })],
          }),
        },
      })
    })

    cy.interceptGraphql({
      operationName: "complexSearchForWorkTeaser",
      data: complexSearchForWorkTeaser.build({
        complexSearch: {
          hitcount: identifiers.length,
          works,
        },
      }),
    })

    cy.intercept("GET", "/ap-service/pubhub-adapter/v1/products/*", reg => {
      // Intercept the request and respond with a mocked product
      const id = reg.url.split("/").pop() // Get the last part of the URL which is the product ID

      reg.reply({
        statusCode: 200,
        body: getV1ProductsIdentifierAdapterFactory.build({
          product: { externalProductId: { id }, costFree: true },
        }),
        headers: { "content-type": "application/json" },
      })
    })

    cy.dataCy("loan-slider").should("be.visible")
    cy.dataCy("loan-slider-next-button").click()
    cy.dataCy("loan-slider-prev-button").click()
    cy.dataCy("loan-slider-work").should("have.length", identifiers.length)
  })

  it("Should logout when clicking logout button", () => {
    performLoginCallback()
    mockFrontpage()

    cy.dataCy("logout-button").click()

    cy.location("pathname").should("eq", "/")
  })
})
