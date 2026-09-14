import { type Mockttp, getLocal } from "mockttp"

import {
  MockGraphQLMutationParams,
  MockGraphQLQueryParams,
  MockRestResponseParams,
  MockSoapResponseParams,
} from "../commands"

/**
 * Wrapper around the mockttp server backing the Cypress e2e suite.
 *
 * Rule registration and startup are asynchronous in mockttp, and callers must
 * await them. A rule that is still in flight when the browser navigates leaves
 * the request unmatched, and mockttp answers those with a plain-text 503 that
 * the DPL CMS fetcher cannot parse. `reset()` is synchronous by contrast.
 */
class MockApiServer {
  private readonly server: Mockttp
  private readonly port: number

  shouldEnableDebug() {
    if (process.env.DEBUG_MOCK_SERVER === "true") {
      this.server.enableDebug()
    }
  }

  constructor() {
    this.server = getLocal()
    this.port = 9000 // The port to listen for incoming requests
  }

  reset() {
    this.server.reset()
    this.shouldEnableDebug()
  }

  async start() {
    await this.server.start(this.port)
    this.shouldEnableDebug()
  }

  async stop() {
    await this.server.stop()
    console.info(`Mock API server stopped`)
  }

  async mockGraphQLQuery({ operationName, data }: MockGraphQLQueryParams) {
    await this.server.forAnyRequest().withBodyIncluding(operationName).thenJson(200, { data })
  }

  async mockGraphQLMutation({ operationName, data }: MockGraphQLMutationParams) {
    await this.server.forAnyRequest().withBodyIncluding(operationName).thenJson(200, { data })
  }

  async mockRestResponse({ method, path: url, data, statusCode = 200 }: MockRestResponseParams) {
    switch (method) {
      case "GET":
        await this.server.forGet(url).thenJson(statusCode, data)
        break
      case "POST":
        await this.server.forPost(url).thenJson(statusCode, data)
        break
      case "PUT":
        await this.server.forPut(url).thenJson(statusCode, data)
        break
      case "DELETE":
        await this.server.forDelete(url).thenJson(statusCode, data)
        break
    }
  }

  async mockSoapResponse({ path: url, data, statusCode = 200 }: MockSoapResponseParams) {
    await this.server.forPost(url).thenCallback(() => ({
      status: statusCode,
      headers: {
        "content-type": "application/soap+xml; charset=utf-8",
      },
      body: data,
    }))
  }
}

export default MockApiServer
