import "./commands"
import { mockConfig } from "./mocks"

beforeEach(() => {
  mockConfig()
})

afterEach(() => {
  cy.resetServerMocks()
})
