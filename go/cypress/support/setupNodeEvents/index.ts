import MockApiServer from "./mockApiServer"

export const e2eNodeEvents: Cypress.Config["e2e"]["setupNodeEvents"] = on => {
  const mockApiServer = new MockApiServer()

  on("before:run", () => {
    mockApiServer.start()
  })

  on("after:run", () => {
    mockApiServer.stop()
  })

  on("task", {
    mockApiResponse({ operationName, data }) {
      mockApiServer.mockResponse({ operationName, data })
      return null // important to return null from Cypress node event tasks to signal they're complete; see Cypress docs.
    },

    mockApiErrorResponse({ operationName, message }) {
      mockApiServer.mockErrorResponse({ operationName, message })
      return null
    },

    resetApiMocks() {
      mockApiServer.reset()
      return null
    },
  })
}
