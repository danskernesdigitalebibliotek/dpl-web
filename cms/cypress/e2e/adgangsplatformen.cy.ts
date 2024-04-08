describe("Adgangsplatformen", () => {
  it("supports login with both uniqueId and CPR attribute", () => {
    const authorizationCode = "7c5e3213aea6ef42ec97dfeaa6f5b1d454d856dc";
    const accessToken = "447131b0a03fe0421204c54e5c21a60d70030fd1";
    const userGuid = "19a4ae39-be07-4db9-a8b7-8bbb29f03da6";
    const userCPR = 9999999999;

    cy.adgangsplatformenLogin({
      authorizationCode,
      accessToken,
      userCPR,
      userGuid,
    });
    cy.visit("/user");
    cy.url().should("match", /user\/\d+/);
  });

  it("supports login for user with only CPR attribute.", () => {
    // If a user does not have uniqueId attribute, it is a user not previously related to any library.
    const authorizationCode = "7c5e3213aea6ef42ec97dfeaa6f5b1d454d856dc";
    const accessToken = "447131b0a03fe0421204c54e5c21a60-new-user";
    const userCPR = 9999999999;

    cy.adgangsplatformenLogin({
      authorizationCode,
      accessToken,
      userCPR,
    });
    cy.visit("/user");
    cy.url().should("match", /user\/\d+/);
  });

  it("supports login for user only with uniqueId attribute.", () => {
    // If a user do not have a CPR attribute, it is probably a test user.
    const authorizationCode = "7c5e3213aea6ef42ec97dfeaa6f5b1d454d856dc";
    const accessToken = "447131b0a03fe0421204c54e5c21a60-new-user";
    const userGuid = "19a4ae39-be07-4db9-a8b7-8bbb29f03da6";

    cy.adgangsplatformenLogin({
      authorizationCode,
      accessToken,
      userGuid,
    });
    cy.visit("/user");
    cy.url().should("match", /user\/\d+/);
  });

  it("does not support login with users missing both uniqueId and CPR attribute.", () => {
    // If a user do not have a CPR attribute, it is probably a test user.
    const authorizationCode = "7c5e3213aea6ef42ec97dfeaa6f5b1d454d856dc";
    const accessToken = "447131b0a03fe0421204c54e5c21a60-new-user";

    cy.adgangsplatformenLogin({
      authorizationCode,
      accessToken,
    });
    cy.contains(
      "body",
      "The website encountered an unexpected error. Please try again later."
    );
  });

  // When a user comes back from authentication with MitID, the user should
  // not be able to do anything else other than registering or cancelling.
  // Check that the header and footer sections is not vissible.
  it("does not show header and footer section for unregistered user", () => {
    cy.setupAdgangsplatformenRegisterMappinngs({
      authorizationCode: "7c5e3213aea6ef42ec97dfeaa6f5b1d454d856dc",
      accessToken: "447131b0a03fe0421204c54e5c21a60-new-user",
      userCPR: 1412749999,
    });

    cy.clearCookies();
    cy.visit("/");
    // Open user menu.
    cy.get(".header__menu-profile").click();
    // Click create profile.
    cy.get(".modal-login__btn-create-profile").click();
    cy.get("main#main-content")
      .get(".paragraphs__item--user_registration_section__link")
      .first()
      .click();

    cy.request("/dpl-react/user-tokens").then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).contain(
        'window.dplReact = window.dplReact || {};\nwindow.dplReact.setToken("unregistered-user", "447131b0a03fe0421204c54e5c21a60-new-user")'
      );
    });

    cy.get(".header").should("not.exist");
    cy.get(".footer").should("not.exist");
  });

  it("can register a new user and expose the right tokens for the react apps", () => {
    cy.setupAdgangsplatformenRegisterMappinngs({
      authorizationCode: "7c5e3213aea6ef42ec97dfeaa6f5b1d454d856dc",
      accessToken: "447131b0a03fe0421204c54e5c21a60-new-user",
      userCPR: 1412749999,
    });

    cy.clearCookies();
    cy.visit("/");
    cy.get(".header__menu-profile").click();
    cy.get(".modal-login__btn-create-profile").click();
    cy.get("main#main-content")
      .get(".paragraphs__item--user_registration_section__link")
      .first()
      .click();
    cy.request("/dpl-react/user-tokens").then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).contain(
        'window.dplReact = window.dplReact || {};\nwindow.dplReact.setToken("unregistered-user", "447131b0a03fe0421204c54e5c21a60-new-user")'
      );
    });

    cy.get('[data-cy="phone-input"]').type("12345678");
    cy.get('[data-cy="email-address-input"]').type("john@doe.com");
    cy.get('[data-cy="pincode-input"]').type("1234");
    cy.get('[data-cy="pincode-confirm-input"]').type("1234");
    cy.get("#branches-dropdown").select("DK-775100");
    cy.get('[data-cy="complete-user-registration-button"]').click();
    cy.request("/dpl-react/user-tokens").then((response) => {
      expect(response.body).contain(
        'window.dplReact = window.dplReact || {};\nwindow.dplReact.setToken("user", "447131b0a03fe0421204c54e5c21a60-new-user")'
      );
      expect(response.body).not.contain(
        'window.dplReact = window.dplReact || {};\nwindow.dplReact.setToken("unregistered-user", "447131b0a03fe0421204c54e5c21a60-new-user")'
      );
    });
  });

  it("can cancel user registration from the user registration page", () => {
    cy.setupAdgangsplatformenRegisterMappinngs({
      authorizationCode: "7c5e3213aea6ef42ec97dfeaa6f5b1d454d856dc",
      accessToken: "447131b0a03fe0421204c54e5c21a60-new-user",
      userCPR: 1412749999,
    });

    cy.clearCookies();
    cy.visit("/");
    cy.get(".header__menu-profile").click();
    cy.get(".modal-login__btn-create-profile").click();
    cy.get("main#main-content")
      .get(".paragraphs__item--user_registration_section__link")
      .first()
      .click();
    cy.request("/dpl-react/user-tokens").then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).contain(
        'window.dplReact = window.dplReact || {};\nwindow.dplReact.setToken("unregistered-user", "447131b0a03fe0421204c54e5c21a60-new-user")'
      );
    });

    cy.get('[data-cy="cancel-user-registration-button"]').click();

    cy.request("/dpl-react/user-tokens").then((response) => {
      expect(response.body).not.contain(
        'window.dplReact = window.dplReact || {};\nwindow.dplReact.setToken("user", "447131b0a03fe0421204c54e5c21a60-new-user")'
      );
      expect(response.body).not.contain(
        'window.dplReact = window.dplReact || {};\nwindow.dplReact.setToken("unregistered-user", "447131b0a03fe0421204c54e5c21a60-new-user")'
      );
    });
  });

  beforeEach(() => {
    cy.resetMappings();
  });

  afterEach(() => {
    cy.logMappingRequests();
  });
});
