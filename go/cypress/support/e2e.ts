import "./commands"
import { mockConfig, mockFrontpage } from "./mocks"

beforeEach(() => {
  mockConfig()
  mockFrontpage()
})

afterEach(() => {
  cy.resetServerMocks()
})
