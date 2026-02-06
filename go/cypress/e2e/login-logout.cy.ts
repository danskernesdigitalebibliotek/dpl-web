import routes from "@/lib/config/resolvers/routes"

import getAdgangsplatformenUserToken from "../factories/dpl-cms/getAdgangsplatformenUserToken"
import configuration from "../factories/unilogin/configuration"
import institution from "../factories/unilogin/institution"
import introspection from "../factories/unilogin/introspection"
import tokenSet from "../factories/unilogin/tokenSet"
import userinfo from "../factories/unilogin/userinfo"
import { mockAPProfilePage, mockFrontpage, mockUniloginProfilePage } from "../support/mocks"

describe("Login / Logout UI Tests", () => {
  beforeEach(() => {
    mockFrontpage()
    cy.visit("/")

    // @todo Instead of ignoring exception we should mock the data.
    // Ignore fetch errors from DPL CMS
    cy.expectError("Failed to fetch data from DPL CMS")
  })

  it("Should open and close login modal", () => {
    // Click profile button
    cy.dataCy("profile-button").click()

    // Check if login modal is open and visible
    cy.dataCy("global-sheet").should("be.visible")

    // Close login modal
    cy.dataCy("global-sheet-close-button").click()

    // Check if login modal is closed
    cy.dataCy("global-sheet").should("not.exist")
  })

  it("Should open unilogin page", () => {
    // Click profile button
    cy.dataCy("profile-button").click()

    // Check if login modal is open and visible
    cy.dataCy("global-sheet").should("be.visible")

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
    // Click profile button
    cy.dataCy("profile-button").click()

    // Check if login modal is open and visible
    cy.dataCy("global-sheet").should("be.visible")

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
  beforeEach(() => {
    mockFrontpage()
    cy.visit("/")

    // @todo Instead of ignoring exception we should mock the data.
    // Ignore fetch errors from DPL CMS
    cy.expectError("Failed to fetch data from DPL CMS")
  })

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
    // Click profile button
    cy.dataCy("profile-button").click()

    // Check if login modal is open and visible
    cy.dataCy("global-sheet").should("be.visible")

    performLoginCallback()

    cy.location("pathname").should("eq", "/user/profile")
  })

  it("Should show loans on unilogin user profile page", () => {
    performLoginCallback()
    mockUniloginProfilePage()

    cy.dataCy("loan-slider").should("be.visible")
    cy.dataCy("loan-slider-next-button").click()
    cy.dataCy("loan-slider-prev-button").click()
    cy.dataCy("loan-slider-work").should("have.length", 9)
  })

  it("Should logout when clicking logout button", () => {
    // Click profile button
    cy.dataCy("profile-button").click()

    // Check if login modal is open and visible
    cy.dataCy("global-sheet").should("be.visible")

    performLoginCallback()
    mockUniloginProfilePage()

    cy.dataCy("logout-button").click()

    cy.location("pathname").should("eq", "/")
  })
})

describe("Adgangsplatformen: Login / Logout API Tests", () => {
  beforeEach(() => {
    mockFrontpage()
    cy.visit("/")

    // @todo Instead of ignoring exception we should mock the data.
    // Ignore fetch errors from DPL CMS
    cy.expectError("Failed to fetch data from DPL CMS")
  })

  const performLoginCallback = () => {
    const mockedCallbackUrl = "/auth/callback/adgangsplatformen"

    //Set mocked session cookie
    cy.setCookie("SSESS", "cookie-value")

    cy.mockServerGraphQLQuery({
      operationName: "getAdgangsplatformenUserToken",
      data: getAdgangsplatformenUserToken.build(),
    })

    cy.visit(mockedCallbackUrl)
  }

  it("Should login when performing adgangsplatformen callback", () => {
    performLoginCallback()

    cy.location("pathname").should("eq", "/user/profile")
  })

  it("Should show loans on adgangsplatformen user profile page", () => {
    performLoginCallback()
    mockAPProfilePage()

    cy.dataCy("loan-slider").should("be.visible")
    cy.dataCy("loan-slider-next-button").click()
    cy.dataCy("loan-slider-prev-button").click()
    cy.dataCy("loan-slider-work").should("have.length", 9)
  })

  it("Should logout when clicking logout button", () => {
    performLoginCallback()
    mockFrontpage()

    cy.dataCy("logout-button").click()

    cy.location("pathname").should("eq", "/")
  })
})
