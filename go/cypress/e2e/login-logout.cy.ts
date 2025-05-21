import getLoginUrls from "../factories/dpl-cms/getLoginUrls"

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

  it.only("Should open unilogin page", () => {
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
  it("Should login when performing unilogin callback", () => {
    cy.mockServerRest({
      method: "GET",
      path: "/auth/callback/unilogin",
      data: { message: "success" },
    })

    cy.visit("/auth/callback/unilogin")
  })
})
