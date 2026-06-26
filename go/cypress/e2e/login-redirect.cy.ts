import routes from "@/lib/config/resolvers/routes"

import getAdgangsplatformenUserToken from "../factories/dpl-cms/getAdgangsplatformenUserToken"
import getMaterial from "../factories/fbi/getMaterial"
import configuration from "../factories/unilogin/configuration"
import institution from "../factories/unilogin/institution"
import introspection from "../factories/unilogin/introspection"
import tokenSet from "../factories/unilogin/tokenSet"
import userinfo from "../factories/unilogin/userinfo"
import { mockConfig, mockFrontpage } from "../support/mocks"

describe("Login redirect after loan attempt", () => {
  beforeEach(() => {
    mockConfig()
    mockFrontpage()

    // Suppress known SSR hydration error from ResponsiveDialog/useMediaQuery.
    // Dev builds throw the readable message; production builds (CI) throw the
    // minified form, so suppress both.
    cy.expectError("useMediaQuery is a client-only hook")
    cy.expectError("Minified React error #419")

    cy.visit("/")
  })

  it("Should redirect to loan modal after UNI•Login when loan was attempted", () => {
    cy.interceptGraphql({
      operationName: "getMaterial",
      data: getMaterial.build(),
    })

    cy.visit("/work/work-of%3A870970-basis%3A136817027")

    // Select audiobook tab
    cy.get("[data-cy='slide-select-option']").eq(1).click()

    // Click "Lån lydbog" to open LoanLoginModal
    cy.contains("Lån lydbog").click()

    // LoanLoginModal should be visible
    cy.dataCy("loan-login-modal").should("be.visible")

    // Intercept UNI•Login URL to prevent leaving the test domain
    cy.intercept("GET", routes["routes.login.unilogin"], {
      statusCode: 200,
      body: "<html>I am login page</html>",
      headers: { "content-type": "text/html" },
    })

    // Click UNI•Login button — this sets the redirect cookie, then navigates
    cy.dataCy("loan-login-modal-unilogin-button").click()

    // Verify we arrived at the login page (cookie is now set)
    cy.location("pathname").should("eq", routes["routes.login.unilogin"])

    // Re-mock getMaterial for the redirected page load
    cy.interceptGraphql({
      operationName: "getMaterial",
      data: getMaterial.build(),
    })

    // Mock UNI•Login OAuth endpoints
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

    // Visit the callback URL — server reads the redirect cookie and redirects
    cy.visit(mockedCallbackUrl)

    // Assert we were redirected to the material page with the loan modal open
    cy.url().should("include", "modal=LoanMaterialModal")
    cy.location("pathname").should("not.eq", "/user/profile")
  })

  it("Should redirect to loan modal after Adgangsplatformen login when loan was attempted", () => {
    cy.interceptGraphql({
      operationName: "getMaterial",
      data: getMaterial.build(),
    })

    cy.visit("/work/work-of%3A870970-basis%3A136817027")

    // Select ebook tab
    cy.get("[data-cy='slide-select-option']").eq(2).click()

    // Click "Lån e-bog" to open LoanLoginModal
    cy.contains("Lån e-bog").click()

    // LoanLoginModal should be visible
    cy.dataCy("loan-login-modal").should("be.visible")

    // Intercept Adgangsplatformen login URL
    cy.intercept("GET", "/mocked/login*", {
      statusCode: 200,
      body: "<html>I am login page</html>",
      headers: { "content-type": "text/html" },
    })

    // Click Adgangsplatformen button — this sets the redirect cookie, then navigates
    cy.dataCy("loan-login-modal-adgangsplatformen-button").click()

    // Verify we arrived at the login page (cookie is now set)
    cy.location("pathname").should("eq", "/mocked/login")

    // Re-mock getMaterial for the redirected page load
    cy.interceptGraphql({
      operationName: "getMaterial",
      data: getMaterial.build(),
    })

    // Mock Adgangsplatformen callback
    cy.setCookie("SSESS", "cookie-value")

    cy.mockServerGraphQLQuery({
      operationName: "getAdgangsplatformenUserToken",
      data: getAdgangsplatformenUserToken.build(),
    })

    // Visit the callback URL — server reads the redirect cookie and redirects
    cy.visit("/auth/callback/adgangsplatformen")

    // Assert we were redirected to the material page with the loan modal open
    cy.url().should("include", "modal=LoanMaterialModal")
    cy.location("pathname").should("not.eq", "/user/profile")
  })
})
