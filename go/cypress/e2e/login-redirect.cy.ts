import getAdgangsplatformenUserToken from "../factories/dpl-cms/getAdgangsplatformenUserToken"
import getMaterial from "../factories/fbi/getMaterial"
import { mockConfig, mockFrontpage, mockUniloginLoginCallback } from "../support/mocks"

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

  it("Should redirect to loan modal after Unilogin when loan was attempted", () => {
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

    // Intercept the mocked CMS login page to prevent leaving the test domain
    cy.intercept("GET", "/mocked/login*", {
      statusCode: 200,
      body: "<html>I am login page</html>",
      headers: { "content-type": "text/html" },
    })

    // Click Unilogin button — this sets the redirect cookie, then navigates
    cy.dataCy("loan-login-modal-unilogin-button").click()

    // Verify we arrived at the login page (cookie is now set)
    cy.location("pathname").should("eq", "/mocked/login")
    cy.location("search").should("eq", "?idp=unilogin")

    // Re-mock getMaterial for the redirected page load
    cy.interceptGraphql({
      operationName: "getMaterial",
      data: getMaterial.build(),
    })

    // Mock the CMS handing out a Unilogin token
    mockUniloginLoginCallback()

    // Visit the callback URL — server reads the redirect cookie and redirects
    cy.visit("/auth/callback/adgangsplatformen")

    // Assert we were redirected to the material page with the loan modal open.
    // The modal param is a one-shot inbox — it opens the modal and is
    // stripped from the URL — so assert the visible outcome instead.
    cy.dataCy("loan-material-modal").should("be.visible")
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

    // Assert we were redirected to the material page with the loan modal open.
    // The modal param is a one-shot inbox — it opens the modal and is
    // stripped from the URL — so assert the visible outcome instead.
    cy.dataCy("loan-material-modal").should("be.visible")
    cy.location("pathname").should("not.eq", "/user/profile")
  })
})
