import GetAdgangsplatformenLibraryToken from "../factories/getAdgangsplatformenLibraryToken"
import "./commands"

beforeEach(() => {
  // Mock the library token request
  cy.task("mockApiResponse", {
    operationName: "getAdgangsplatformenLibraryToken",
    data: GetAdgangsplatformenLibraryToken.build(),
  })
})

afterEach(() => {
  cy.task("resetApiMocks")
})
