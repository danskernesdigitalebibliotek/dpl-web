describe("Material buttons", () => {
  it("Renders a clickable find on shelf button even if no materials are available", () => {
    cy.interceptRest({
      aliasName: "Availability",
      url: "**/availability/v3?recordid=**",
      fixtureFilePath: "material/unavailability.json"
    });
    cy.visit(
      "/iframe.html?id=apps-material--default&viewMode=story&type=bog"
    ).scrollTo("bottom", { duration: 300 });

    cy.getBySel("material-description").scrollIntoView();

    cy.getBySel("availability-label").contains("bog").first().click();
    cy.getBySel("material-header-buttons-find-on-shelf")
      .should("exist")
      .and("be.enabled");
  });

  it("Doesn't render find on shelf button for online materials", () => {
    cy.visit("/iframe.html?id=apps-material--default&viewMode=story&type=bog")
      .getBySel("material-description")
      .scrollIntoView({ duration: 300 });

    cy.getBySel("availability-label").contains("e-bog").first().click();

    cy.getBySel("material-description").scrollIntoView();

    cy.getBySel("material-header-buttons-find-on-shelf").should("not.exist");
  });

  it("Renders a reservation button for physical materials with material type", () => {
    cy.visit("/iframe.html?id=apps-material--default&viewMode=story&type=bog")
      .getBySel("material-description")
      .scrollIntoView({ duration: 300 });

    cy.getBySel("availability-label").contains("bog").first().click();
    cy.getBySel("material-header-buttons-physical")
      .should("exist")
      .and("contain", "bog");
    cy.getBySel("availability-label")
      .contains("lydbog (cd-mp3)")
      .first()
      .click();
    cy.getBySel("material-header-buttons-physical")
      .should("exist")
      .and("contain", "lydbog (cd-mp3)");
  });

  it("Renders reservation button disabled if a material isn't reservable", () => {
    cy.interceptRest({
      aliasName: "Availability",
      url: "**/availability/v3?recordid=**",
      fixtureFilePath: "material/unavailability.json"
    });
    cy.visit("/iframe.html?id=apps-material--default&viewMode=story&type=bog")
      .getBySel("material-description")
      .scrollIntoView({ duration: 500 });

    cy.getBySel("availability-label").contains("bog").first().click();
    cy.getBySel("material-header-buttons-cant-reserve")
      .should("be.disabled")
      .and("contain", "Can't be reserved");
  });

  it("Renders the correct action button for ebooks", () => {
    cy.visit(
      "/iframe.html?id=apps-material--default&viewMode=story&type=e-bog"
    ).scrollTo("bottom", {
      duration: 1000
    });

    cy.getBySel("availability-label").contains("e-bog").first().click();
    cy.getBySel("material-header-author-text").scrollIntoView({
      duration: 300
    });

    cy.getBySel("material-header-buttons-online-internal-reader").contains(
      "Loan e-bog"
    );
  });

  it("Renders the correct action button for movies from filmstriben", () => {
    cy.interceptGraphql({
      operationName: "getMaterial",
      fixtureFilePath: "material-buttons/material-buttons-movie-fbi-api.json"
    });

    cy.visit(
      "/iframe.html?id=apps-material--underverden&viewMode=story&type=film (online)"
    )
      .getBySel("material-description")
      .scrollIntoView({ duration: 300 });

    cy.getBySel("availability-label").contains("film (online)").first().click();
    cy.getBySel("material-buttons-online-external").contains(
      "Go to filmstriben"
    );
  });

  it("Renders the correct action button for articles", () => {
    cy.interceptGraphql({
      operationName: "getMaterial",
      fixtureFilePath: "material-buttons/material-buttons-article-fbi-api.json"
    });

    cy.visit(
      "/iframe.html?id=apps-material--infomedia&viewMode=story&type=artikel+%28online%29"
    )
      .getBySel("material-description")
      .scrollIntoView({ duration: 300 });

    cy.getBySel("availability-label").contains("artikel (online)");
    cy.getBySel("material-buttons-online-external").contains("See online");
  });

  it.skip("Renders the correct action button for online audio books", () => {
    cy.visit("/iframe.html?id=apps-material--default&viewMode=story&type=bog")
      .getBySel("material-description")
      .scrollIntoView({ duration: 300 });

    cy.getBySel("availability-label")
      .contains("lydbog (online)")
      .first()
      .click();
    cy.getBySel("material-buttons-online-external").contains("Listen online");
  });

  it.skip("Renders the correct action button for other online materials", () => {
    cy.visit("/iframe.html?id=apps-material--default&viewMode=story&type=bog")
      .getBySel("material-description")
      .scrollIntoView({ duration: 300 });

    cy.getBySel("availability-label").contains("musik").first().click();
    cy.getBySel("material-buttons-online-external").contains("See online");
  });

  it("Renders the correct action button for ordering digital articles", () => {
    cy.interceptGraphql({
      operationName: "getMaterial",
      fixtureFilePath:
        "material-buttons/material-buttons-order-digital-fbi-api.json"
    });
    cy.interceptRest({
      aliasName: "UserInfo",
      url: "**/userinfo",
      fixtureFilePath: "material/userinfo.json"
    });
    cy.createFakeAuthenticatedSession();
    cy.visit(
      "/iframe.html?id=apps-material--digital&viewMode=story&type=artikel"
    )
      .getBySel("material-description")
      .scrollIntoView({ duration: 300 });
    cy.getBySel("material-header-buttons-online-digital-article").contains(
      "Order digital copy"
    );
  });

  it("Renders correct action button for ordering a physical article with 'DigitalArticle' access", () => {
    // The dynamic availability intercept in `beforeEach` covers the FBS call
    // for this test: it echoes the requested recordids with reservable=true.
    // Earlier this block also registered a fixture-based "Holdings" intercept
    // pointed at the availability URL with a holdings-shaped JSON — that was
    // a copy-paste bug that worked only because the legacy code didn't
    // validate the response shape.
    cy.interceptGraphql({
      operationName: "getMaterial",
      fixtureFilePath:
        "material-buttons/material-buttons-physical-article-digital-access-fbi-api.json"
    });
    cy.visit(
      "/iframe.html?id=apps-material--periodical-multiple-accesses&viewMode=story&type=tidsskrift"
    )
      .getBySel("material-description")
      .scrollIntoView({ duration: 300 });
    cy.getBySel("material-header-buttons-physical").contains(
      "Reserve tidsskrift"
    );
  });

  it("Renders the correct action button for ordering a 'DigitalArticle' with only physical access type", () => {
    cy.interceptGraphql({
      operationName: "getMaterial",
      fixtureFilePath:
        "material-buttons/material-buttons-digital-article-with-physical-access-type-fbi-api.json"
    });
    cy.interceptRest({
      aliasName: "FBSPatron",
      url: "**fbs-openplatform.dbc.dk/external/agencyid/patrons/patronid/v4",
      fixtureFilePath: "cover/cover.json"
    });
    cy.interceptRest({
      aliasName: "UserInfo",
      url: "**/userinfo",
      fixtureFilePath: "material/userinfo.json"
    });
    cy.createFakeAuthenticatedSession();
    cy.visit(
      "/iframe.html?id=apps-material--digital&viewMode=story&type=artikel"
    )
      .getBySel("material-description")
      .scrollIntoView({ duration: 300 });
    cy.getBySel("material-header-buttons-online-digital-article").contains(
      "Order digital copy"
    );
    cy.getBySel("material-header-buttons-physical").should("not.exist");
  });

  it("Renders the correct action button for infomedia articles", () => {
    cy.interceptGraphql({
      operationName: "getMaterial",
      fixtureFilePath:
        "material-buttons/material-buttons-infomedia-fbi-api.json"
    });
    cy.interceptRest({
      aliasName: "UserInfo",
      url: "**/userinfo",
      fixtureFilePath: "material/userinfo.json"
    });
    cy.createFakeAuthenticatedSession();
    cy.visit("/iframe.html?id=apps-material--infomedia&viewMode=story")
      .getBySel("material-description")
      .scrollIntoView({ duration: 300 });

    cy.getBySel("material-header-buttons-online-infomedia-article")
      .should("exist")
      .and("contain", "Read article");
  });

  it("Renders a disabled button for blocked users for physical works", () => {
    cy.interceptRest({
      aliasName: "user",
      url: "**/agencyid/patrons/patronid/v4",
      fixtureFilePath: "material/user-blocked.json"
    });
    cy.createFakeAuthenticatedSession();
    cy.visit("/iframe.html?id=apps-material--default&viewMode=story&type=bog")
      .getBySel("material-description")
      .scrollIntoView({ duration: 500 });

    cy.getBySel("material-header-buttons-physical-user-blocked")
      .should("be.visible")
      .and("contain", "User blocked")
      .and("be.disabled");
  });

  beforeEach(() => {
    cy.interceptRest({
      httpMethod: "POST",
      aliasName: "reservations",
      url: "**/patrons/patronid/reservations/**",
      fixtureFilePath: "material/reservations.json"
    });

    cy.interceptRest({
      aliasName: "holdings",
      url: "**/agencyid/catalog/holdingsLogistics/**",
      fixtureFilePath: "material/holdings.json"
    });

    cy.interceptRest({
      aliasName: "branches",
      url: "**/agencyid/branches",
      fixtureFilePath: "material/branches.json"
    });

    cy.interceptRest({
      aliasName: "user",
      url: "**/agencyid/patrons/patronid/v4",
      fixtureFilePath: "material/user.json"
    });

    // FBS responds with one entry per requested recordid. Static fixtures
    // don't model that — they return the same record regardless of the URL,
    // which silently mismatched recordids in the past. Echo the requested
    // recordids so every manifestation lookup gets a real answer. Tests that
    // need the unavailable case override this with a fixture in the `it`.
    cy.interceptRest({
      aliasName: "Availability",
      url: "**/availability/v3?recordid=**",
      buildBody: (req) => {
        const params = new URLSearchParams(req.url.split("?")[1]);
        return params.getAll("recordid").map((recordId) => ({
          recordId,
          available: true,
          reservable: true,
          reservations: 0
        }));
      }
    });

    cy.interceptGraphql({
      operationName: "WorkRecommendations",
      fixtureFilePath: "material/material-grid-related-recommendations.json"
    });

    cy.interceptGraphql({
      operationName: "GetCoversByPids",
      fixtureFilePath: "cover/cover.json"
    });

    // Intercept like button
    cy.intercept("HEAD", "**/list/default/**", {
      statusCode: 404
    }).as("Favorite list service");

    // Intercept url "translation".
    cy.interceptRest({
      aliasName: "UrlProxy",
      url: "**/dpl-url-proxy?url=**",
      fixtureFilePath: "material/dpl-url-proxy.json"
    });

    cy.interceptGraphql({
      operationName: "getMaterial",
      fixtureFilePath: "material-buttons/material-buttons-fbi-api.json"
    });
  });
});

export default {};
