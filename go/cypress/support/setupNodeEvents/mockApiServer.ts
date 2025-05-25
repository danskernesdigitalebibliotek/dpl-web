import { type Mockttp, getLocal } from "mockttp"

import {
  MockGraphQLMutationParams,
  MockGraphQLQueryParams,
  MockRestResponseParams,
} from "../commands"

class MockApiServer {
  private readonly server: Mockttp
  private readonly port: number

  constructor() {
    this.server = getLocal()
    this.port = 9000 // The port to listen for incoming requests
  }

  reset() {
    this.server.reset()
    this.server.enableDebug()
  }

  start() {
    this.server.start(this.port)
    this.server.enableDebug()
  }

  stop() {
    this.server.stop().then(() => {
      console.info(`Mock API server stopped`)
    })
  }

  mockGraphQLQuery({ operationName, data }: MockGraphQLQueryParams) {
    this.server.forAnyRequest().withBodyIncluding(operationName).thenJson(200, { data })
  }

  mockGraphQLMutation({ operationName, data }: MockGraphQLMutationParams) {
    this.server.forAnyRequest().withBodyIncluding(operationName).thenJson(200, { data })
  }

  mockRestResponse({ method, path: url, data, statusCode = 200 }: MockRestResponseParams) {
    switch (method) {
      case "GET":
        this.server.forGet(url).thenJson(statusCode, data)
        break
      case "POST":
        this.server.forPost(url).thenJson(statusCode, data)
        break
      case "PUT":
        this.server.forPut(url).thenJson(statusCode, data)
        break
      case "DELETE":
        this.server.forDelete(url).thenJson(statusCode, data)
        break
    }
  }
}

export default MockApiServer
