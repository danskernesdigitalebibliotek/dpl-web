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

  /**
   * TEMPORARY (DDF-480 flake hunt): name every request no rule matched.
   * Unmatched requests otherwise surface only as mockttp's plain-text 503,
   * which the fetchers report as an unhelpful JSON parse error.
   *
   * Rules are dropped by reset(), so this has to be re-registered after one.
   */
  async logUnmatchedRequests() {
    await this.server.forUnmatchedRequest().thenCallback(async request => {
      const body = await request.body.getText()
      console.error(
        `\x1b[31m[mock] UNMATCHED\x1b[0m ${request.method} ${request.url} :: ${body?.slice(0, 300) ?? "<no body>"}`
      )
      return {
        status: 503,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ error: "No mock rule matched this request" }),
      }
    })
  }

  async reset() {
    this.server.reset()
    this.shouldEnableDebug()
    await this.logUnmatchedRequests()
  }

  async start() {
    await this.server.start(this.port)
    this.shouldEnableDebug()
    await this.logUnmatchedRequests()
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
