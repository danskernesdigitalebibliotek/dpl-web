// eslint-disable-next-line @typescript-eslint/no-var-requires
const autosuggestData = require("../../wiremock/src/mappings/search/data/fbi/autosugggest.json");

describe("User journey", () => {
  it("Shows search suggestions & redirects to search result page", () => {
    cy.createMapping({
      request: {
        method: "POST",
        url: "/opac/graphql",
      },
      response: {
        headers: {
          "Content-Type": "application/json",
        },
        status: 200,
        jsonBody: autosuggestData,
      },
    });

    cy.visit("/")
      .get(".header__menu-search-input")
      .focus()
      .type("harry")
      .get(".autosuggest")
      .should("be.visible")
      .get(".autosuggest__text")
      .eq(0)
      .click()
      .url()
      .should("include", "search?q=Harry%2520Potter");
  });

  beforeEach(() => {
    cy.resetMappings();
  });
});
