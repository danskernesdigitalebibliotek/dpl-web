describe("Check static pages", () => {
  it("does 'Privatlivspolitik' page exist", () => {
    cy.visit("/privatlivspolitik");
    cy.get("main#main-content").get(".article-header").should("exist");
  });
  it("does 'Velkommen' page exist", () => {
    cy.visit("/velkommen");
    cy.get("main#main-content").get(".article-header").should("exist");
  });
  it("does 'Pausefunktion' page exist", () => {
    cy.visit("/pausefunktion");
    cy.get("main#main-content").get(".article-header").should("exist");
  });
  it("does 'Takster' page exist", () => {
    cy.visit("/takster");
    cy.get("main#main-content").get(".article-header").should("exist");
  });
  it("does 'Reglement' page exist", () => {
    cy.visit("/reglement");
    cy.get("main#main-content").get(".article-header").should("exist");
  });
  it("does 'Opret bruger' page exist", () => {
    cy.visit("/opret-bruger");
    cy.get("main#main-content").get(".article-header").should("exist");
  });
});
