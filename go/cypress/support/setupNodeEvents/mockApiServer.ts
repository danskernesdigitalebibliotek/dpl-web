import { HttpResponse, graphql, http } from "msw"
import { setupServer } from "msw/node"

import {
  MockGraphQLMutationParams,
  MockGraphQLQueryParams,
  MockRestResponseParams,
} from "../commands"

class MockApiServer {
  private readonly server

  constructor() {
    this.server = setupServer()
  }

  reset() {
    this.server.resetHandlers()
  }

  start() {
    this.server.listen({ onUnhandledRequest: "warn" })
    console.info(`\n MSW Node server is running and intercepting requests\n`)
  }

  stop() {
    this.server.close()
    console.info(`MSW Node server stopped`)
  }

  mockGraphQLQuery({ operationName, data }: MockGraphQLQueryParams) {
    const handler = graphql.query(operationName, () => {
      return HttpResponse.json({ data })
    })

    this.server.use(handler)
  }

  mockGraphQLMutation({ operationName, data }: MockGraphQLMutationParams) {
    const handler = graphql.mutation(operationName, () => {
      return HttpResponse.json({ data })
    })

    this.server.use(handler)
  }

  mockRestResponse({ method, url, data }: MockRestResponseParams) {
    const handler = http[method](url, () => {
      return HttpResponse.json(data)
    })

    this.server.use(handler)
  }
}

export default MockApiServer
