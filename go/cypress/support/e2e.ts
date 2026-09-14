import "./commands"
import { mockConfig } from "./mocks"

beforeEach(() => {
  mockConfig()
})

// TEMPORARY (DDF-480 flake hunt): report the state of both skeleton gates on
// every paragraph that exposes them, so a failing run says which one is stuck.
afterEach(function () {
  const testTitle = this.currentTest?.fullTitle() ?? "unknown test"
  const testState = this.currentTest?.state ?? "unknown"

  cy.document({ log: false }).then(document => {
    const gates = Array.from(document.querySelectorAll("[data-in-view]")).map(
      (element, index) =>
        `#${index} inView=${element.getAttribute("data-in-view")} loading=${element.getAttribute("data-loading")}`
    )

    if (gates.length > 0) {
      cy.task("debugLog", `${testState.toUpperCase()} — ${testTitle} :: ${gates.join(" | ")}`, {
        log: false,
      })
    }
  })

  cy.resetServerMocks()
})
