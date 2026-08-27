import { TOKEN_USER_KEY } from "../../core/token";
import {
  MaterialPage,
  materialStory
} from "../../../cypress/page-objects/material/MaterialPage";
import { CanLoanResponseType } from "@danskernesdigitalebibliotek/dpl-service-layer/biblio/contract";
import {
  givenBiblioCanLoan,
  givenBiblioCannotAnswerCanLoan
} from "../../../cypress/intercepts/biblio/biblio";
import { stubMaterialPageBackends } from "../../../cypress/intercepts/material-page";

/**
 * The availability label on the material page during the transition.
 *
 * With the flag on Biblio is the lending provider, so its answer is what
 * the label shows - and Publizon's is not consulted, even for a material it
 * would happily report on. The unit tests cover the hooks; this covers what a
 * user actually sees.
 */

// Publizon calls the e-book available (status 4, the shared default). The
// tests below expect the opposite, so a label that says otherwise can only
// have come from Biblio - and one that agrees with Publizon proves nothing.
const stubBackends = () => stubMaterialPageBackends();

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

  // TEMPORARY, with the gate it covers: today a visitor who is not signed in
  // gets Publizon's answer, because Biblio has no way to give one.
  it("Leaves Biblio alone when nobody is signed in", () => {
    // Given: Biblio would say otherwise if it were asked
    givenBiblioCanLoan(CanLoanResponseType.reservable);
    cy.window().then((win) => win.sessionStorage.removeItem(TOKEN_USER_KEY));

    // When: the flag is on, but there is no user to ask on behalf of
    const material = new MaterialPage(materialStory.withBiblioAdapter);
    material.visit([]);

    // Then: Publizon answers instead, and the page survives - asking Biblio
    // would be a 403 that takes the whole material page down.
    cy.wait("@publizonLoanStatus");
    ebookLabel(material).should("contain", "Available");

    cy.get("@biblioCanLoan.all").should("have.length", 0);
  });

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

/**
 * TEMPORARY, with the toleration flag it covers.
 *
 * The catalogue lists digital materials WeDoBooks has not provisioned yet,
 * and the adapter answers 404 for those. Without the flag that error takes
 * the whole material page down; with it the material is simply unavailable.
 * Remove together with ServiceLayerConfig.tolerateUnknownMaterials.
 */
describe("Material page - a material the adapter does not know", () => {
  beforeEach(() => stubBackends());

  it("Shows it as unavailable instead of failing the page", () => {
    // Given: the adapter has never heard of the e-book
    givenBiblioCannotAnswerCanLoan("9788702441000");

    // When: the library tolerates that
    const material = new MaterialPage(materialStory.withTolerantBiblioAdapter);
    material.visit([]);
    cy.wait("@biblioCanLoanUnknown");

    // Then: the page is alive and the label answers - unavailable, even
    // though Publizon calls it loanable. The 404 was processed as an answer,
    // not thrown as an error, and Publizon was not asked to stand in.
    ebookLabel(material).should("contain", "Unavailable");
  });
});
