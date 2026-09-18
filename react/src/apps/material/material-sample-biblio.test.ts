import {
  MaterialPage,
  materialStory
} from "../../../cypress/page-objects/material/MaterialPage";
import {
  givenBiblioCanLoan,
  givenMaterialHasBiblioSample,
  givenMaterialHasNoBiblioSample,
  givenMaterialIsInBiblio,
  givenUserHasBiblioLoanQuotas,
  givenUserHasNoBiblioLoans,
  givenUserHasNoBiblioReservations
} from "../../../cypress/intercepts/biblio/biblio";
import {
  givenTheVisitorIsNotSignedIn,
  stubMaterialPageBackends
} from "../../../cypress/intercepts/material-page";

/**
 * Trying a digital material without borrowing it.
 *
 * This is the one thing the adapter answers for a visitor who is not signed
 * in: it hands out the excerpt file itself, and the WeDoBooks SDK opens it
 * without a session. Borrowing, queuing and quotas all still need a patron,
 * so an anonymous visitor seeing the Try button is the intended shape of the
 * page - not a bug.
 */

// The ISBN of the e-book edition in the default material factory.
const EBOOK_ISBN = "9788702441000";

const TEASER_BUTTON = "material-header-buttons-online-internal-reader-teaser";
const LOAN_BUTTON = "material-header-buttons-online-internal-reader";

const openEbook = () => {
  const material = new MaterialPage(materialStory.withBiblioAdapter, "e-bog");
  material.visit([]);
  // The e-book edition is reached from the availability labels.
  cy.getBySel("availability-label").contains("e-bog").first().click();
};

describe("Material page - trying a digital material through Biblio", () => {
  beforeEach(() => {
    stubMaterialPageBackends();

    cy.interceptRest({
      aliasName: "UserInfo",
      url: "**/userinfo",
      fixtureFilePath: "material/userinfo.json"
    });
    cy.interceptRest({
      aliasName: "FBSPatron",
      url: "**/fbs-openplatform.dbc.dk/external/agencyid/patrons/patronid/v4",
      fixtureFilePath: "material/user.json"
    });

    // The material is Biblio's and borrowable, so nothing about the teaser
    // can be explained by the page failing to offer the material at all.
    givenMaterialIsInBiblio({ isbn: EBOOK_ISBN, title: "De syv søstre" });
    givenBiblioCanLoan();
    givenUserHasBiblioLoanQuotas();
    givenUserHasNoBiblioLoans();
    givenUserHasNoBiblioReservations();
  });

  it("Offers the excerpt to a visitor who is not signed in", () => {
    // Given: Biblio has an excerpt, and nobody is signed in
    givenMaterialHasBiblioSample(EBOOK_ISBN);
    givenTheVisitorIsNotSignedIn();

    openEbook();

    // Then: the teaser is offered for real. Asserted as enabled rather than
    // merely present: a visitor used to get this very button in a disabled
    // state, so presence alone would pass on the old behaviour too.
    //
    // Not asserted on an href: at this size MaterialSecondaryLink renders a
    // button that navigates through redirectTo, not an anchor, so there is
    // none to read.
    cy.wait(`@biblioSample_${EBOOK_ISBN}`);
    cy.getBySel(TEASER_BUTTON)
      .first()
      .should("contain", "Try e-bog")
      .and("not.be.disabled");
  });

  it("Offers no excerpt for a material Biblio has none of", () => {
    // Given: the material is Biblio's, but carries no excerpt
    givenMaterialHasNoBiblioSample(EBOOK_ISBN);
    givenTheVisitorIsNotSignedIn();

    openEbook();

    // Then: no teaser at all - offering one would open an empty reader. The
    // loan button is what proves the page finished rendering, so the absence
    // is not just an unrendered header.
    cy.wait(`@biblioSampleMissing_${EBOOK_ISBN}`);
    cy.getBySel(LOAN_BUTTON).should("exist");
    cy.getBySel(TEASER_BUTTON).should("not.exist");
  });
});
