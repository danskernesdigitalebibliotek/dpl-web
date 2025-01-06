describe("Front Page Tests", () => {
  it("Should include a header and a footer", () => {
    cy.visit("/")

    cy.get("header").should("exist")
    cy.get("footer").should("exist")
  })
})
