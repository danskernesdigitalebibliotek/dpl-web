/// <reference types="cypress" />

// custom namespace for Cypress commands
declare namespace Cypress {
  interface Chainable {
    dataCy(selector: string): Chainable<JQuery<HTMLElement>>
  }
}
