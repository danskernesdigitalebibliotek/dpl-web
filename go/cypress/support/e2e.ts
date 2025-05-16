import coverService from "../factories/covers/coverService"
import GetAdgangsplatformenLibraryToken from "../factories/dpl-cms/getAdgangsplatformenLibraryToken"
import GetDplCmsPrivateConfiguration from "../factories/dpl-cms/getDplCmsPrivateConfiguration"
import GetDplCmsPublicConfiguration from "../factories/dpl-cms/getDplCmsPublicConfiguration"
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

  cy.mockServerGraphQLQuery({
    operationName: "getDplCmsPrivateConfiguration",
    data: GetDplCmsPrivateConfiguration.build(),
  })

  cy.interceptCovers({
    covers: coverService.build(),
  })
})

afterEach(() => {
  cy.resetServerMocks()
})
