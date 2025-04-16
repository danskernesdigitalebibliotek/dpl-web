/* eslint-disable @typescript-eslint/no-namespace */
import { Cover } from "@/lib/rest/cover-service-api/generated/model"

import { CyKey } from "./constants"
import { Operations, hasOperationName } from "./utils"

type InterceptGraphqlParams = {
  /**
   * The name of the graphql operation to be mocked
   */
  operationName: Operations
  /**
   * The fishery data to use for response
   */
  data?: object
  /**
   * The status code to return (defaults to 200)
   */
  statusCode?: number
}

type InterceptCoversParams = {
  /**
   * The fishery data to use for response
   */
  covers: Cover
  /**
   * The status code to return (defaults to 200)
   */
  statusCode?: number
}

export type MockGraphQLQueryParams = {
  operationName: string
  data: object
}

export type MockGraphQLMutationParams = {
  operationName: string
  data: object
}

export type MockRestResponseParams = {
  method: "get" | "post" | "put" | "delete" | "patch"
  url: string
  data: object
}

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to select DOM element by data-cy attribute.
       * @param value - The data-cy attribute value to select
       * @example cy.dataCy('work-card')
       */
      dataCy(value: CyKey): Chainable<JQuery<HTMLElement>>

      /**
       * Expects and ignores specific uncaught exceptions during test execution
       * @param errorMessage - The error message text to ignore
       * @example cy.expectError("Failed to fetch data from DPL CMS")
       */
      expectError(errorMessage: string): void

      /**
       * Intercepts a GraphQL request that returns fishery data
       * @param params - The parameters for intercepting the GraphQL request
       * @example cy.interceptGraphql({ operationName: "searchWithPagination", data: SearchWithPaginationFactory.build() })
       */
      interceptGraphql(params: InterceptGraphqlParams): void

      /**
       * Intercepts cover request that returns fishery data
       * @param params - The parameters for intercepting the cover request
       * @example cy.interceptCovers({ covers: coverService.build() })
       */
      interceptCovers(params: InterceptCoversParams): void

      /**
       * Mocks a server-side GraphQL query using MSW
       * @param params - The parameters for mocking the GraphQL query
       * @example cy.mockServerGraphQLQuery({ operationName: "GetUser", data: { user: { id: 1, name: "Test User" } } })
       */
      mockServerGraphQLQuery(params: MockGraphQLQueryParams): void

      /**
       * Mocks a server-side GraphQL mutation using MSW
       * @param params - The parameters for mocking the GraphQL mutation
       * @example cy.mockServerGraphQLMutation({ operationName: "UpdateUser", data: { success: true } })
       */
      mockServerGraphQLMutation(params: MockGraphQLMutationParams): void

      /**
       * Mocks a server-side REST API endpoint using MSW
       * @param params - The parameters for mocking the REST API endpoint
       * @example cy.mockServerRest({ method: "get", url: "/api/users", data: { users: [] } })
       */
      mockServerRest(params: MockRestResponseParams): void

      /**
       * Resets all server-side MSW mocks
       * @example cy.resetServerMocks()
       */
      resetServerMocks(): void
    }
  }
}

Cypress.Commands.add("dataCy", selector => {
  return cy.get(`[data-cy="${selector}"]`)
})

Cypress.Commands.add("expectError", (errorMessage: string) => {
  cy.on("uncaught:exception", err => {
    if (err.message.includes(errorMessage)) {
      return false
    }
    return true
  })
})

Cypress.Commands.add(
  "interceptGraphql",
  ({ operationName, data, statusCode = 200 }: InterceptGraphqlParams) => {
    cy.intercept("POST", "**/ap-service/**", req => {
      if (hasOperationName(req, operationName)) {
        if (data) {
          req.reply({ body: { data }, statusCode })
        } else {
          req.reply({ statusCode })
        }
      }
    }).as(`${operationName} GraphQL operation`)
  }
)

Cypress.Commands.add("interceptCovers", ({ covers, statusCode = 200 }: InterceptCoversParams) => {
  cy.intercept("GET", "**/covers**", req => {
    if (covers) {
      req.reply({ body: [covers], statusCode })
    } else {
      req.reply({ statusCode })
    }
  }).as(`Cover Service`)
})

/**
 * Server-side GraphQL query mocking with MSW
 */
Cypress.Commands.add("mockServerGraphQLQuery", props => {
  cy.task("mockGraphQLQuery", props)
})

/**
 * Server-side GraphQL mutation mocking with MSW
 */
Cypress.Commands.add("mockServerGraphQLMutation", props => {
  cy.task("mockGraphQLMutation", props)
})

/**
 * Server-side REST API mocking with MSW
 */
Cypress.Commands.add("mockServerRest", props => {
  cy.task("mockRestResponse", props)
})

/**
 * Reset all server-side MSW mocks
 * Should not be neccessary to use this command, as MSW will automatically reset mocks before each test
 */
Cypress.Commands.add("resetServerMocks", () => {
  cy.task("resetApiMocks")
})
