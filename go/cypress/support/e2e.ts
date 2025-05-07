import GetAdgangsplatformenLibraryToken from "../factories/getAdgangsplatformenLibraryToken"
import GetDplCmsPublicConfiguration from "../factories/getDplCmsPublicConfiguration"
import "./commands"

beforeEach(() => {
  // Mock the library token request
  cy.mockServerGraphQLQuery({
    operationName: "getAdgangsplatformenLibraryToken",
    data: GetAdgangsplatformenLibraryToken.build(),
  })

  cy.mockServerGraphQLQuery({
    operationName: "getDplCmsPublicConfiguration",
    data: GetDplCmsPublicConfiguration.transient({
      appUrl: Cypress.env("NEXT_PUBLIC_APP_URL"),
    }).build(),
  })
})

afterEach(() => {
  cy.resetServerMocks()
})
