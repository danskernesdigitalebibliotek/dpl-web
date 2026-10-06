import {
  MaterialPage,
  materialStory
} from "../../../cypress/page-objects/material/MaterialPage";
import { CanLoanResponseType } from "@danskernesdigitalebibliotek/dpl-service-layer/biblio/contract";
import {
  givenBiblioCanLoan,
  givenBiblioDoesNotKnowMaterial
} from "../../../cypress/intercepts/biblio/biblio";
import {
  givenTheVisitorIsNotSignedIn,
  stubMaterialPageBackends
} from "../../../cypress/intercepts/material-page";
import { ContentLoanStatusEnum } from "../../core/publizon/model";

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
const stubBackends = (publizonLoanStatus?: ContentLoanStatusEnum) =>
  stubMaterialPageBackends(publizonLoanStatus);

const ebookLabel = (material: MaterialPage) =>
  material.elements
    .headerAvailabilityLabels()
    .contains(".availability-label", "e-bog");

describe("Material page - online availability through the Biblio adapter", () => {
  beforeEach(() => stubBackends());

  // No test for "adapter says loanable, label says available": an online
  // material defaults to available before any answer arrives, so it would
  // pass whether Biblio was heard or ignored. The unit test "Counts a
  // loanable material as available" pins that direction.
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

  it("Asks nobody when nobody is signed in, and shows the material as available", () => {
    // Given: both providers would call it unavailable if they were asked
    stubBackends(ContentLoanStatusEnum.NUMBER_5);
    givenBiblioCanLoan(CanLoanResponseType.reservable);
    givenTheVisitorIsNotSignedIn();

    // When: the flag is on, but there is no user to ask on behalf of
    const material = new MaterialPage(materialStory.withBiblioAdapter);
    material.visit([]);

    // Then: nobody was asked, so the label shows the default for online
    // materials - Biblio needs a user, and Publizon must not stand in
    ebookLabel(material).should("contain", "Available");

    cy.get("@biblioCanLoan.all").should("have.length", 0);
    cy.get("@publizonLoanStatus.all").should("have.length", 0);
  });

  // No flag-off test here: whether the label asks Biblio at all is decided in
  // the availability hook, whose unit tests pin both flag states. The write
  // path the flag gates is covered by material-biblio.test.ts.
});

/**
 * The catalogue lists digital materials WeDoBooks has not provisioned, and
 * the adapter answers 404 for those. That is an answer, not an error: the
 * material cannot be borrowed and the page stays up.
 */
describe("Material page - a material the adapter does not know", () => {
  beforeEach(() => stubBackends());

  it("Shows it cannot be borrowed instead of failing the page", () => {
    // Given: the adapter has never heard of the e-book
    givenBiblioDoesNotKnowMaterial("9788702441000");

    // When: the patron opens it with the library lending through Biblio
    const material = new MaterialPage(materialStory.withBiblioAdapter);
    material.visit([]);
    cy.wait("@biblioCanLoanUnknown");

    // Then: the page is alive and the label says the material cannot be
    // borrowed - not that it is out on loan - and Publizon, which calls it
    // loanable, was not asked to stand in.
    ebookLabel(material).should("contain", "Cannot be borrowed");
    cy.get("@publizonLoanStatus.all").should("have.length", 0);
  });
});
