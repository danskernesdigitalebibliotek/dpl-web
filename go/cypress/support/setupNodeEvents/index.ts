import {
  MockGraphQLMutationParams,
  MockGraphQLQueryParams,
  MockRestResponseParams,
} from "../commands"
import MockApiServer from "./mockApiServer"

export const e2eNodeEvents: Cypress.Config["e2e"]["setupNodeEvents"] = on => {
  const mockApiServer = new MockApiServer()

  on("before:run", () => {
    mockApiServer.start()
  })

  on("after:run", () => {
    mockApiServer.stop()
  })

  function log(requestType: string, operationName: string) {
    console.info(`\x1b[32m${requestType}:`, `\x1b[34m${operationName}`)
  }

  on("task", {
    mockGraphQLQuery({ operationName, data }: MockGraphQLQueryParams) {
      log("Mocking GraphQL query", operationName)

      mockApiServer.mockGraphQLQuery({ operationName, data })
      return null // Return null to indicate that the task has been completed
    },

    mockGraphQLMutation({ operationName, data }: MockGraphQLMutationParams) {
      log("Mocking GraphQL mutation", operationName)

      mockApiServer.mockGraphQLMutation({ operationName, data })
      return null // Return null to indicate that the task has been completed
    },

    mockRestResponse({ method, url, data }: MockRestResponseParams) {
      log("Mocking REST response", `${method} ${url}`)

      mockApiServer.mockRestResponse({ method, url, data })
      return null // Return null to indicate that the task has been completed
    },

    resetApiMocks() {
      mockApiServer.reset()
      return null
    },
  })
}
