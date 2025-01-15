/* eslint-disable @typescript-eslint/no-namespace */
import { Factory } from "fishery"

import { Operations } from "@/lib/graphql/generated/fbi/types"

import { CyKey } from "./constants"
import { hasOperationName } from "./utils"

declare global {
  namespace Cypress {
    interface Chainable {
      dataCy(value: CyKey): Chainable<JQuery<HTMLElement>>
      interceptGraphql(prams: InterceptGraphqlParams): void
    }
  }
}

Cypress.Commands.add("dataCy", selector => {
  return cy.get(`[data-cy="${selector}"]`)
})

/**
 * interceptGraphql is used to make a graphQL request that returns fixture data
 *
 * @param {Operations} operationName The name of the operation to be mocked.
 * @param {Factory<any>} factory The path to the fixture file to use as response
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
          console.info(responseData)
          req.reply({ body: { data: responseData }, statusCode })
        } else {
          req.reply({ statusCode })
        }
      }
    }).as(`${operationName} GraphQL operation`)
  }
)
