// # Disable running this job on pull requests
// # TODO: Enable this when the Cypress mock data is ready for the front page
describe.skip("Front Page Tests", () => {
  it("Should include a header and a footer", () => {
    cy.visit("/")

    cy.get("header").should("exist")
    cy.get("footer").should("exist")
    cy.dataCy("go-logo").should("exist")
  })
})
