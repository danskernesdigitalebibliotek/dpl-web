const loanListStory = "/iframe.html?path=/story/apps-loan-list--primary";

/**
 * Stubs the patron request, aliased as "patron". Pass null for a patron who
 * is not blocked.
 */
const interceptPatron = (blockedReason: "E" | "U" | "W" | null) => {
  cy.intercept("GET", "**/external/agencyid/patrons/patronid/v4**", {
    patron: {
      blockStatus: blockedReason
        ? [{ blockedReason, blockedSince: "", message: "" }]
        : null
    }
  }).as("patron");
};

describe("Patron page", () => {
  beforeEach(() => {
    cy.createFakeAuthenticatedSession();
    cy.createFakeLibrarySession();
    cy.intercept("GET", "**/external/agencyid/patrons/patronid/loans/v2**", {
      statusCode: 200,
      body: []
    });
    cy.intercept("GET", "**/v1/user/**", {
      statusCode: 200,
      body: {
        loans: []
      }
    });
  });

  it("Patron not blocked", () => {
    interceptPatron(null);
    cy.visit(loanListStory);
    // Check for the modal only once the page knows the patron's block status.
    cy.wait("@patron");
    cy.get(".modal").should("not.exist");
  });

  // TYPE: E (fee)
  // Blocked types:
  // https://github.com/itk-dev/dpl-react/blob/develop/src/core/utils/types/BlockedTypes.ts
  it("Patron blocked E", () => {
    interceptPatron("E");
    cy.visit(loanListStory);
    cy.getBySel("modal").should("exist");
    cy.getBySel("modal").get("h1").should("exist");
    cy.getBySel("modal").get("p").should("exist");
    cy.getBySel("modal").get("a").should("exist");
  });

  it("Does NOT show the blocked modal again once it has been shown", () => {
    interceptPatron("E");
    cy.visit(loanListStory);
    cy.wait("@patron");
    cy.getBySel("modal").should("exist");

    cy.visit(loanListStory);
    cy.wait("@patron");
    cy.getBySel("modal").should("not.exist");
  });

  // TYPE: U (exclusion)
  // Blocked types:
  // https://github.com/itk-dev/dpl-react/blob/develop/src/core/utils/types/BlockedTypes.ts
  it("Patron blocked U", () => {
    interceptPatron("U");
    cy.visit(loanListStory);
    cy.getBySel("modal").should("exist");
    cy.getBySel("modal").get("h1").should("exist");
    cy.getBySel("modal").get("p").should("exist");
    // TODO: figure out why this test fails and fix it
    // cy.getBySel("modal").get("a").should("not.exist");
  });

  // TYPE: W (selfcreated)
  // Blocked types:
  // https://github.com/itk-dev/dpl-react/blob/develop/src/core/utils/types/BlockedTypes.ts
  it("Patron blocked W", () => {
    interceptPatron("W");
    cy.visit(loanListStory);
    cy.getBySel("modal").should("exist");
    cy.getBySel("modal").get("h1").should("exist");
    cy.getBySel("modal").get("p").should("exist");
    // TODO: figure out why this test fails and fix it
    // cy.getBySel("modal").get("a").should("not.exist");
  });
});

export {};
