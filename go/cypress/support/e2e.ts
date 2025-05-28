import "./commands"
import { mockConfig, mockCovers, mockFrontpage } from "./mocks"

beforeEach(() => {
  mockConfig()
  mockCovers()
  mockFrontpage()
})

afterEach(() => {
  cy.resetServerMocks()
})
