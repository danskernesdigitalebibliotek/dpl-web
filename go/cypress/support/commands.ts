/* eslint-disable @typescript-eslint/no-namespace */
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
 * @param {string} fixtureFilePath The path to the fixture file to use as response
 *
 */
type InterceptGraphqlParams = {
  operationName: Operations
  fixtureFilePath?: string
  statusCode?: number
}
Cypress.Commands.add(
  "interceptGraphql",
  ({ operationName, fixtureFilePath, statusCode = 200 }: InterceptGraphqlParams) => {
    cy.intercept("POST", "**/next*/graphql", req => {
      if (hasOperationName(req, operationName)) {
        if (fixtureFilePath) {
          req.reply({ fixture: fixtureFilePath, statusCode })
        } else {
          req.reply({ statusCode })
        }
      }
    }).as(`${operationName} GraphQL operation`)
  }
)
