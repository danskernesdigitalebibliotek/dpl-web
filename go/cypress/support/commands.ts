/* eslint-disable @typescript-eslint/no-namespace */
import { Factory } from "fishery"

import { Cover } from "@/lib/rest/cover-service-api/generated/model"

import { CyKey } from "./constants"
import { Operations } from "./utils"
import { hasOperationName } from "./utils"

declare global {
  namespace Cypress {
    interface Chainable {
      dataCy(value: CyKey): Chainable<JQuery<HTMLElement>>
      interceptGraphql(prams: InterceptGraphqlParams): void
      interceptCovers(prams: InterceptCoversParams): void
    }
  }
}

Cypress.Commands.add("dataCy", selector => {
  return cy.get(`[data-cy="${selector}"]`)
})

/**
 * interceptGraphql is used to intercept a graphQL request that returns fishery data
 *
 * @param {Operations} operationName The name of the operation to be mocked.
 * @param {Factory<any>} factory The fishory factory to use for response data
 * @param {number} statusCode The status code to return.
 *
 */
type InterceptGraphqlParams = {
  operationName: Operations
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  factory?: Factory<any>
  statusCode?: number
}
Cypress.Commands.add(
  "interceptGraphql",
  ({ operationName, factory, statusCode = 200 }: InterceptGraphqlParams) => {
    cy.intercept("POST", "**/graphql", req => {
      if (hasOperationName(req, operationName)) {
        if (factory) {
          const responseData = factory.build()
          req.reply({ body: { data: responseData }, statusCode })
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
 * @param {Covers[]} covers The array of overs which will be returned.
 * @param {number} statusCode The status code to return.
 *
 */
type InterceptCoversParams = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  covers: Cover[]
  statusCode?: number
}
Cypress.Commands.add("interceptCovers", ({ covers, statusCode = 200 }: InterceptCoversParams) => {
  cy.intercept("GET", "**/covers**", req => {
    if (covers) {
      req.reply({ body: { data: covers }, statusCode })
    } else {
      req.reply({ statusCode })
    }
  }).as(`Cover Service`)
})
