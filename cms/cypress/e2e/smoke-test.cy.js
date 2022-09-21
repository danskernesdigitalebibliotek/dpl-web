describe("DPL CMS", () => {
  it("loads the front page", () => {
    cy.visit("/");
    cy.contains("DPL CMS");
  });
});
