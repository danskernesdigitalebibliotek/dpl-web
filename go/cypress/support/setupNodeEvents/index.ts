import Redis from "ioredis"
import { randomUUID } from "node:crypto"

import { TSessionType } from "@/lib/types/session"

import {
  MockGraphQLMutationParams,
  MockGraphQLQueryParams,
  MockRestResponseParams,
  MockSoapResponseParams,
} from "../commands"
import MockApiServer from "./mockApiServer"

const SESSION_KEY_PREFIX = "go:session:"
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7

export const e2eNodeEvents: Cypress.Config["e2e"]["setupNodeEvents"] = (on, config) => {
  const mockApiServer = new MockApiServer()
  let redis: Redis | null = null

  on("before:run", () => {
    mockApiServer.start()

    const redisUrl = process.env.REDIS_URL
    if (!redisUrl) {
      throw new Error("REDIS_URL must be set for Cypress E2E runs")
    }
    redis = new Redis(redisUrl)

    if (config.env.viewport) {
      log("Running test with viewport:", config.env.viewport, true)
    }
  })

  on("after:run", async () => {
    mockApiServer.stop()
    if (redis) {
      await redis.quit()
      redis = null
    }
  })

  function log(requestType: string, operationName: string, force: boolean = false) {
    if (process.env.DEBUG_MOCK_SERVER === "true" || force) {
      console.info(`\x1b[32m${requestType}`, `\x1b[34m${operationName}`)
    }
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

    mockRestResponse({ method, path, data }: MockRestResponseParams) {
      log("Mocking REST response", `${method} ${path}`)

      mockApiServer.mockRestResponse({ method, path, data })
      return null // Return null to indicate that the task has been completed
    },

    mockSoapResponse({ path, data }: MockSoapResponseParams) {
      log("Mocking SOAP response", path)
      mockApiServer.mockSoapResponse({ path, data })
      return null // Return null to indicate that the task has been completed
    },

    async getMockedGoSessionCookieValue({ type }: { type: TSessionType }) {
      if (!redis) {
        throw new Error("Redis client is not initialized")
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
      const payload = { ...values.default, ...values[type] }

      const sessionId = randomUUID()
      await redis.set(
        `${SESSION_KEY_PREFIX}${sessionId}`,
        JSON.stringify(payload),
        "EX",
        SESSION_TTL_SECONDS
      )
      return sessionId
    },

    resetApiMocks() {
      mockApiServer.reset()
      return null
    },
  })
}
