import { sealData } from "iron-session"

import { TSessionType } from "@/lib/types/session"

import {
  MockGraphQLMutationParams,
  MockGraphQLQueryParams,
  MockRestResponseParams,
  MockSoapResponseParams,
} from "../commands"
import MockApiServer from "./mockApiServer"

export const e2eNodeEvents: Cypress.Config["e2e"]["setupNodeEvents"] = (on, config) => {
  const mockApiServer = new MockApiServer()

  on("before:run", async () => {
    await mockApiServer.start()

    if (config.env.viewport) {
      log("Running test with viewport:", config.env.viewport, true)
    }
  })

  on("after:run", async () => {
    await mockApiServer.stop()
  })

  function log(requestType: string, operationName: string, force: boolean = false) {
    if (process.env.DEBUG_MOCK_SERVER === "true" || force) {
      console.info(`\x1b[32m${requestType}`, `\x1b[34m${operationName}`)
    }
  }

  on("task", {
    async mockGraphQLQuery({ operationName, data }: MockGraphQLQueryParams) {
      log("Mocking GraphQL query", operationName)

      await mockApiServer.mockGraphQLQuery({ operationName, data })
      return null // Return null to indicate that the task has been completed
    },

    async mockGraphQLMutation({ operationName, data }: MockGraphQLMutationParams) {
      log("Mocking GraphQL mutation", operationName)

      await mockApiServer.mockGraphQLMutation({ operationName, data })
      return null // Return null to indicate that the task has been completed
    },

    async mockRestResponse({ method, path, data }: MockRestResponseParams) {
      log("Mocking REST response", `${method} ${path}`)

      await mockApiServer.mockRestResponse({ method, path, data })
      return null // Return null to indicate that the task has been completed
    },

    async mockSoapResponse({ path, data }: MockSoapResponseParams) {
      log("Mocking SOAP response", path)
      await mockApiServer.mockSoapResponse({ path, data })
      return null // Return null to indicate that the task has been completed
    },

    async getMockedGoSessionCookieValue({ type }: { type: TSessionType }) {
      const password = process.env.GO_SESSION_SECRET
      if (!password) {
        throw new Error("GO_SESSION_SECRET is not defined")
      }

      if (!["unilogin", "adgangsplatformen", "anonymous"].includes(type)) {
        return null
      }

      const values = {
        unilogin: { user: { username: "uniloginUserName" } },
        adgangsplatformen: { user: { name: "Firstname Lastname" } },
        anonymous: { isLoggedIn: false },
        default: { isLoggedIn: true, type },
      }

      const encodedSession = await sealData({ ...values.default, ...values[type] }, { password })
      return encodedSession
    },

    async resetApiMocks() {
      await mockApiServer.reset()
      return null
    },
  })
}
