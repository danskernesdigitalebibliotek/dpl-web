import GetAdgangsplatformenLibraryToken from "../factories/getAdgangsplatformenLibraryToken"
import "./commands"

beforeEach(() => {
  // Mock the library token request
  cy.mockServerGraphQLQuery({
    operationName: "getAdgangsplatformenLibraryToken",
    data: GetAdgangsplatformenLibraryToken.build(),
  })
})

afterEach(() => {
  cy.resetServerMocks()
})
