const coverUrlPattern = /^https:\/\/res\.cloudinary\.com\/.*\.(jpg|jpeg|png)$/;

describe("Material - Retriever", () => {
  beforeEach(() => {
    cy.interceptGraphql({
      operationName: "GetCoversByPids",
      fixtureFilePath: "cover/cover.json"
    });
    cy.intercept(
      {
        url: coverUrlPattern
      },
      {
        fixture: "images/cover.jpg"
      }
    );

    cy.interceptRest({
      aliasName: "Availability",
      url: "**/availability/v3?recordid=**",
      fixtureFilePath: "material/availability.json"
    });

    cy.intercept("HEAD", "**/list/default/**", {
      statusCode: 404
    }).as("Favorite list service");

    cy.interceptRest({
      aliasName: "periodical holdings",
      url: "**/agencyid/catalog/holdingsLogistics/**",
      // I'm not sure why the test is being skipped, but when we decide to fix it, the material/periodical-holdings.json should be updated as well.
      fixtureFilePath: "material/periodical-holdings.json"
    });

    cy.interceptGraphql({
      operationName: "getMaterial",
      fixtureFilePath: "material/retriever-fbi-api.json"
    });

    cy.interceptGraphql({
      operationName: "getRetriever",
      fixtureFilePath: "material/retriever-article.json"
    });

    cy.visit("/iframe.html?id=apps-material--retriever&viewMode=story");
  });

  it.skip("Render Retriever + Read article + Close modal", () => {
    cy.getBySel("material-header-buttons-online-retriever-article")
      .should("be.visible")
      .and("contain", "Read article")
      .click();

    cy.get("h2")
      .should("be.visible")
      .and("contain", "BUTLERENS UTROLIGE HISTORIE");

    cy.getBySelStartEnd("modal-retriever-modal-", "-close-button")
      .should("be.visible")
      .click();
  });
});

export default {};
