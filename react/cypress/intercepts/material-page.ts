import { TOKEN_LIBRARY_KEY, TOKEN_USER_KEY } from "../../src/core/token";
import { ContentLoanStatusEnum } from "../../src/core/publizon/model";
import { givenAMaterial } from "./fbi/material";
import { interceptFbsCalls } from "./fbs/fbs";
import { interceptPublizonCalls } from "./publizon/interceptPublizonCalls";

/**
 * The backends every material-page test starts from: a signed-in session and
 * FBI, FBS and Publizon served from the shared factory intercepts - a fake
 * token is rejected by every real gateway. Tests layer their own scenario on
 * top; Cypress matches the most recently registered route first.
 */
export const stubMaterialPageBackends = (
  publizonLoanStatus: ContentLoanStatusEnum = ContentLoanStatusEnum.NUMBER_4
) => {
  cy.viewport(1280, 720);

  cy.window().then((win) => {
    // Every backend is stubbed, so the tokens only need to exist. The
    // patron-scoped Biblio endpoints refuse to ask without the user one.
    win.sessionStorage.setItem(TOKEN_USER_KEY, "random-user-token");
    win.sessionStorage.setItem(TOKEN_LIBRARY_KEY, "random-token");
  });

  interceptFbsCalls();
  // Publizon's loan status decides the button for the materials Publizon
  // still holds. For a material the adapter provides, the adapter's can-loan
  // answer takes over.
  interceptPublizonCalls({ loanStatus: { loanStatus: publizonLoanStatus } });

  cy.intercept("POST", "**/next/graphql*", {
    statusCode: 200,
    body: { data: null }
  }).as("dbcGatewayMain");
  cy.intercept("POST", "**/next-present/graphql*", {
    statusCode: 200,
    body: { data: null }
  }).as("dbcGatewayPresent");

  // Registered after the catch-all above so the work query wins.
  givenAMaterial();

  cy.intercept("HEAD", "**/materiallist.dandigbib.org/list/**", {
    statusCode: 200
  });
  cy.intercept("GET", "**/materiallist.dandigbib.org/list/**", {
    statusCode: 200,
    body: []
  });
};
