import "./commands"
import { mockConfig, revalidateConfigCache } from "./mocks"

beforeEach(() => {
  mockConfig()
  // After the mocks, so the next render reads the config from them.
  revalidateConfigCache()
})

afterEach(() => {
  cy.resetServerMocks()
})
