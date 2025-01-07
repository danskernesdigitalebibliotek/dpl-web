/* eslint-disable @typescript-eslint/no-namespace */
import { CyKey } from "./constants"

declare global {
  namespace Cypress {
    interface Chainable {
      dataCy(value: CyKey): Chainable<JQuery<HTMLElement>>
    }
  }
}

Cypress.Commands.add("dataCy", selector => {
  return cy.get(`[data-cy="${selector}"]`)
})
