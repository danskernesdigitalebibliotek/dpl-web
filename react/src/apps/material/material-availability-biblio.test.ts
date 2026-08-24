import { TOKEN_LIBRARY_KEY, TOKEN_USER_KEY } from "../../core/token";
import {
  MaterialPage,
  materialStory
} from "../../../cypress/page-objects/material/MaterialPage";
import { CanLoanResponseType } from "@danskernesdigitalebibliotek/dpl-service-layer/biblio/contract";
import { givenBiblioCanLoan } from "../../../cypress/intercepts/biblio/biblio";
import { givenAMaterial } from "../../../cypress/intercepts/fbi/material";
import { interceptFbsCalls } from "../../../cypress/intercepts/fbs/fbs";
import { interceptPublizonCalls } from "../../../cypress/intercepts/publizon/interceptPublizonCalls";
import { ContentLoanStatusEnum } from "../../core/publizon/model";

/**
 * The availability label on the material page during the transition.
 *
 * With the flag on Biblio is the lending provider, so its answer is what
 * the label shows - and Publizon's is not consulted, even for a material it
 * would happily report on. The unit tests cover the hooks; this covers what a
 * user actually sees.
 */

const stubBackends = () => {
  cy.viewport(1280, 720);
  cy.window().then((win) => {
    win.sessionStorage.setItem(TOKEN_LIBRARY_KEY, "random-token");
    // can-loan is patron-scoped, so the availability tests need a signed-in
    // user for Biblio to answer on behalf of.
    win.sessionStorage.setItem(TOKEN_USER_KEY, "random-user-token");
  });

  interceptFbsCalls();
  // Publizon calls the e-book available (status 4). Both tests below expect
  // the opposite, so a label that says otherwise can only have come from
  // Biblio - and one that agrees with Publizon proves nothing.
  interceptPublizonCalls({
    loanStatus: { loanStatus: ContentLoanStatusEnum.NUMBER_4 }
  });

  cy.intercept("POST", "**/next/graphql*", {
    statusCode: 200,
    body: { data: null }
  });
  cy.intercept("POST", "**/next-present/graphql*", {
    statusCode: 200,
    body: { data: null }
  });

  // Registered after the catch-all so the work query wins.
  givenAMaterial();

  cy.intercept("HEAD", "**/materiallist.dandigbib.org/list/**", {
    statusCode: 200
  });
  cy.intercept("GET", "**/materiallist.dandigbib.org/list/**", {
    statusCode: 200,
    body: []
  });
};

const ebookLabel = (material: MaterialPage) =>
  material.elements
    .headerAvailabilityLabels()
    .contains(".availability-label", "e-bog");

describe("Material page - online availability through the Biblio adapter", () => {
  beforeEach(() => stubBackends());

  // Note there is no test for the opposite direction - adapter says loanable,
  // label says available. An online material defaults to available while no
  // answer has arrived, so such a test passes whether Biblio was heard or
  // ignored; the unit test "Counts a loanable material as available" covers
  // that direction where the mapping can be isolated. The test below covers
  // the same mechanism in the direction where the assertion can actually
  // fail.
  it("Shows it as unavailable when Biblio will only queue the user", () => {
    // Given: Biblio will not lend it, only queue the user
    givenBiblioCanLoan(CanLoanResponseType.reservable);

    const material = new MaterialPage(materialStory.withBiblioAdapter);
    material.visit([]);
    cy.wait("@biblioCanLoan");

    // Then: unavailable, even though Publizon reports it as loanable. A
    // material Biblio will not lend is not on offer - falling back would
    // create a loan in the service we are migrating away from.
    ebookLabel(material).should("contain", "Unavailable");
  });

  // No test here that Publizon is never contacted. The material page still
  // asks it for loan status through useReaderPlayer, which is not
  // provider-aware yet - that comes with the reader/player PR. The unit test
  // "Keeps Publizon from answering at all once Biblio is the provider" covers
  // the availability hook itself, where the two can be told apart.

  it("Leaves Biblio alone when the flag is off", () => {
    // Biblio would say otherwise if it were asked
    givenBiblioCanLoan(CanLoanResponseType.reservable);

    // When: the same page at a library that has not enabled Biblio
    const material = new MaterialPage(materialStory.default);
    material.visit([]);

    // Then: Publizon decides, and says the e-book is available
    cy.wait("@publizonLoanStatus");
    ebookLabel(material).should("contain", "Available");

    cy.get("@biblioCanLoan.all").should("have.length", 0);
  });
});
