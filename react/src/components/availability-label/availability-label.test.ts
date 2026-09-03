describe("Availability Label", () => {
  it("shows that at least one of the materials is available", () => {
    cy.intercept("GET", "**/availability/v3?recordid=**", {
      statusCode: 200,
      body: [
        {
          recordId: "11111111",
          reservable: true,
          available: false,
          reservations: 10
        },
        {
          recordId: "22222222",
          reservable: true,
          available: false,
          reservations: 6
        },
        {
          recordId: "33333333",
          reservable: true,
          available: true,
          reservations: 0
        }
      ]
    });
    cy.visit(
      "/iframe.html?id=components-availability-label--more-than-one-id&viewMode=story"
    );
    // Anchored regex so "Available" does not match as a substring of "Unavailable".
    cy.contains(".availability-label__text", /^Available$/);
  });

  it("shows that the material is not available", () => {
    cy.intercept("GET", "**/availability/v3?recordid=**", {
      statusCode: 200,
      body: [
        {
          recordId: "44444444",
          reservable: true,
          available: false,
          reservations: 10
        },
        {
          recordId: "55555555",
          reservable: true,
          available: false,
          reservations: 6
        },
        {
          recordId: "66666666",
          reservable: false,
          available: false,
          reservations: 0
        }
      ]
    });
    cy.visit(
      "/iframe.html?id=components-availability-label--more-than-one-id&viewMode=story"
    );
    cy.contains(".availability-label__text", /^Unavailable$/);
  });
});
