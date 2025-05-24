import getLoginUrls from "../factories/dpl-cms/getLoginUrls"
import complexSearchForWorkTeaser from "../factories/fbi/complexSearchForWorkTeaser"
import configuration from "../factories/unilogin/configuration"
import introspection from "../factories/unilogin/introspection"
import tokenSet from "../factories/unilogin/tokenSet"
import userinfo from "../factories/unilogin/userinfo"

describe("Login / Logout UI Tests", () => {
  beforeEach(() => {
    cy.interceptGraphql({
      operationName: "getLoginUrls",
      data: getLoginUrls.build(),
    })

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

    const uniloginUrl = "/auth/login/unilogin"

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

    Cypress.on("uncaught:exception", () => {
      return false
    })
  })

  it("Should open adgangsplatformen page", () => {
    // Opens login modal with beforeEach

    // Intercept mocked adgangsplatformen login page
    cy.intercept("GET", "/some-path", {
      statusCode: 200,
      body: "<html>I am login page</html>",
      headers: { "content-type": "text/html" },
    })

    // Click adgangsplatformen button
    cy.dataCy("login-sheet-adgangsplatformen-button").click()

    // Check if mocked adgangsplatformen page is open
    cy.location("pathname").should("eq", "/some-path")
  })
})

describe("Login / Logout API Tests", () => {
  const mockedCallbackUrl =
    "/auth/callback/unilogin?session_state=60cda845-402f-4085-b41d-3e4e773e04d4&code=3a6c3675-8ec8-472f-bcd5-9425be472d6d.60cda845-402f-4085-b41d-3e4e773e04d4.135f0ca5-6083-4b5c-9de6-d4a1b3f8d60c"

  it("Should login when performing unilogin callback", () => {
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

    cy.interceptGraphql({
      operationName: "complexSearchForWorkTeaser",
      data: complexSearchForWorkTeaser.build(),
    })

    cy.visit(mockedCallbackUrl)

    cy.location("pathname").should("eq", "/user/profile")
  })
})
