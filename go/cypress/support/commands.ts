/* eslint-disable @typescript-eslint/no-namespace */
import { Cover } from "@/lib/rest/cover-service-api/generated/model"
import { TSessionType } from "@/lib/types/session"

import { CyKey, ViewportType, viewports } from "./constants"
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
  operationName: Operations
  data: object
}

export type MockGraphQLMutationParams = {
  operationName: Operations
  data: object
}

export type MockRestResponseParams = {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
  path: string
  data: object
  statusCode?: number
}

export type MockSoapResponseParams = {
  path: string
  data: string
  statusCode?: number
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
       * Mocks a server-side SOAP API endpoint
       * @param params - The parameters for mocking the SOAP API endpoint
       * @example cy.mockServerSoap({ path: "/institution", data: institution.build() })
       */
      mockServerSoap(params: MockSoapResponseParams): void

      /**
       * Resets all server-side MSW mocks
       * @example cy.resetServerMocks()
       */
      resetServerMocks(): void

      /**
       * Creates a new GO session of the specified type.
       * This custom Cypress command initializes a session for testing purposes,
       * allowing you to simulate different user session types within your tests.
       *
       * @param params - An object containing the session details.
       * @param params.type - The type of session to create (e.g., "unilogin", "adgangsplatformen", etc.).
       * @returns A Cypress Chainable that resolves when the session has been created.
       * @example
       * cy.createGoSession({ type: "unilogin" })
       */
      createGoSession({ type }: { type: TSessionType }): Chainable<void>

      /**
       * Checks if the current viewport is mobile
       * @example cy.isViewport("mobile")
       */
      isViewport(viewport: ViewportType): Chainable<boolean>

      /**
       * Sets the viewport to a specific size
       * @example cy.setViewport("mobile")
       */
      setViewport(viewport: ViewportType): void
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
    cy.intercept("POST", /(ap-service|graphql)/, req => {
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
 * Server-side SOAP API mocking
 */
Cypress.Commands.add("mockServerSoap", props => {
  cy.task("mockSoapResponse", props)
})

/**
 * Reset all server-side MSW mocks
 * Should not be neccessary to use this command, as MSW will automatically reset mocks before each test
 */
Cypress.Commands.add("resetServerMocks", () => {
  cy.task("resetApiMocks")
})

Cypress.Commands.add("isViewport", (viewport: ViewportType) => {
  return cy.window().then(win => {
    return win.innerWidth === viewports[viewport].width
  })
})

Cypress.Commands.add("setViewport", (viewport: ViewportType) => {
  cy.viewport(viewports[viewport].width, viewports[viewport].height)
})

Cypress.Commands.add("createGoSession", ({ type }: { type: TSessionType }) => {
  cy.task("getMockedGoSessionCookieValue", { type }).then(encodedSession => {
    cy.setCookie("go-session", encodedSession as string)
  })
})
