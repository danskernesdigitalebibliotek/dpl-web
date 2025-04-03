import { type Mockttp, getLocal } from "mockttp"

class MockApiServer {
  private readonly server: Mockttp
  private readonly port: number

  constructor() {
    this.server = getLocal()
    this.port = 9000 // Make sure this matches the port in your custom API_URL env url
  }

  reset() {
    this.server.reset()
  }

  start() {
    this.server.start(this.port)
    this.server
      .forPost("/graphql")
      .thenReply(200, "Mock API server is up")
      .then(() => {
        console.info(`\n Mock API server running on http://localhost:${this.port}\n`)
      })
  }

  stop() {
    this.server.stop().then(() => {
      console.info(`Mock API server stopped`)
    })
  }

  mockResponse({ operationName, data }: { operationName: string; data: object }) {
    this.server.forAnyRequest().withJsonBodyIncluding({ operationName }).thenJson(200, { data })
  }

  mockErrorResponse({ operationName, message }: { operationName: string; message: string }) {
    this.server
      .forAnyRequest()
      .withJsonBodyIncluding({ operationName })
      .thenJson(500, { error: message })
  }
}

export default MockApiServer
