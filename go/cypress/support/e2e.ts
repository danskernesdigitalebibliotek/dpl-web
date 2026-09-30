import "./commands"
import { mockConfig, revalidateConfigCache } from "./mocks"

beforeEach(() => {
  mockConfig()
  // Last, so the cache is dropped once every mock this test relies on is
  // registered: the next render then builds its config from them.
  revalidateConfigCache()
})

afterEach(() => {
  cy.resetServerMocks()
})
