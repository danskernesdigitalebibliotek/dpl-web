/* eslint-disable @typescript-eslint/no-namespace */
import { Cover } from "@/lib/rest/cover-service-api/generated/model"

import { CyKey } from "./constants"
import { Operations } from "./utils"
import { hasOperationName } from "./utils"

declare global {
  namespace Cypress {
    interface Chainable {
      dataCy(value: CyKey): Chainable<JQuery<HTMLElement>>
      expectError(errorMessage: string): void
      interceptGraphql(prams: InterceptGraphqlParams): void
      interceptCovers(prams: InterceptCoversParams): void
    }
  }
}

Cypress.Commands.add("dataCy", selector => {
  return cy.get(`[data-cy="${selector}"]`)
})

/**
 * expectError is used to ignore specific uncaught exceptions during test execution
 *
 * @param {string} errorMessage The error message text to ignore
 */
Cypress.Commands.add("expectError", (errorMessage: string) => {
  cy.on("uncaught:exception", err => {
    if (err.message.includes(errorMessage)) {
      return false
    }
    return true
  })
})

/**
 * interceptGraphql is used to intercept a graphQL request that returns fishery data
 *
 * @param {Operations} operationName The name of the operation to be mocked.
 * @param {Data<object>} factory The data to use for response data
 * @param {number} statusCode The status code to return.
 *
 */
type InterceptGraphqlParams = {
  operationName: Operations
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: object
  statusCode?: number
}
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

/**
 * interceptCovers is used to intercept cover request that returns fishery data
 *
 * @param {Covers} covers The array of overs which will be returned.
 * @param {number} statusCode The status code to return.
 *
 */
type InterceptCoversParams = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  covers: Cover
  statusCode?: number
}
Cypress.Commands.add("interceptCovers", ({ covers, statusCode = 200 }: InterceptCoversParams) => {
  cy.intercept("GET", "**/covers**", req => {
    if (covers) {
      req.reply({ body: [covers], statusCode })
    } else {
      req.reply({ statusCode })
    }
  }).as(`Cover Service`)
})
