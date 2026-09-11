import { TOKEN_LIBRARY_KEY, TOKEN_USER_KEY } from "../../../core/token";
import {
  LoanListPage,
  loanListStory
} from "../../../../cypress/page-objects/loan-list/LoanListPage";
import { loanDetailsModalSelector } from "../../../../cypress/page-objects/loan-list/components/loan-details-modal";
import {
  BIBLIO_MATERIAL,
  biblioAudiobookLoanFactory,
  biblioLoanFactory
} from "../../../../cypress/factories/biblio/biblio.factory";
import {
  givenMaterialIsInBiblio,
  givenMaterialIsNotInBiblio,
  givenUserHasBiblioLoans
} from "../../../../cypress/intercepts/biblio/biblio";
import {
  publizonLoanListFactory,
  publizonProductFactory
} from "../../../../cypress/factories/publizon/publizon.factory";

/**
 * A user journey through the loan list during the Publizon → Biblio
 * transition: the library has switched, so the user holds two older Publizon
 * loans and two made through Biblio, in one list.
 *
 * The central assertion follows from the contract. `title`, `author` and
 * `publish_date` are required on a Biblio loan, so it describes itself and is
 * never looked up - where a Publizon loan needs `GET /v1/products/{isbn}`.
 */

/**
 * The four loans the user holds, in the order the list renders them - by due
 * date, oldest first. `row` is each material's place on screen.
 */
// The ids the WeDoBooks reader and player open the two Biblio loans by.
const BIBLIO_EBOOK_LOAN_ID = "3f7b1c62-9d4e-4a71-b0c3-1d5a8e2f4b90";
const BIBLIO_AUDIOBOOK_LOAN_ID = "8c2e5a17-3f4b-4d96-a1e8-7b0c9d2f6e43";

const MATERIAL = {
  biblioAudiobook: {
    ...BIBLIO_MATERIAL.audiobook,
    row: 0 // due 24 Oct
  },
  publizonAudiobook: {
    isbn: "9788702319361",
    title: "Mordet i det blå tog",
    row: 1 // due 26 Oct
  },
  publizonEbook: {
    isbn: "9788771076940",
    title: "Tættere end man tror",
    row: 2 // due 8 Nov
  },
  digitalEbookQuota: {
    ...BIBLIO_MATERIAL.ebook,
    row: 3 // due 16 Nov
  }
} as const;

const stubBackends = () => {
  cy.window().then((win) => {
    // The loan dates from the factories are relative to this date.
    const friday20221021 = new Date("2022-10-21T10:00:00.000").getTime();
    // Only Date: freezing timers stalls TanStack Query's notify scheduler.
    cy.clock(friday20221021, ["Date"]);
    win.sessionStorage.setItem(TOKEN_LIBRARY_KEY, "random-token");
    // Loans are patron-scoped: the adapter answers 403 without a patron, so
    // the service layer refuses to ask. A loan list is a signed-in page.
    win.sessionStorage.setItem(TOKEN_USER_KEY, "random-user-token");
  });

  cy.intercept("GET", "**/external/agencyid/patrons/patronid/v4**", {
    patron: { blockStatus: null }
  });

  // No physical loans - this journey is about the digital ones.
  cy.intercept("GET", "**/external/agencyid/patrons/patronid/loans/v2**", {
    statusCode: 200,
    body: []
  });

  // Given: two older loans still held in Publizon
  cy.intercept("GET", "**/v1/user/**", {
    statusCode: 200,
    body: publizonLoanListFactory.build({
      loans: [
        {
          orderId: "082bb01a-8979-424b-93a6-7cc7081f8a45",
          orderNumber: "0c5a287f-be96-4a68-a85a-453864b330cd",
          orderDateUtc: "2022-10-11T06:32:30Z",
          loanExpireDateUtc: "2022-11-08T06:32:30Z",
          isSubscriptionLoan: false,
          fileExtensionType: 3,
          libraryBook: {
            identifier: MATERIAL.publizonEbook.isbn,
            identifierType: 15,
            title: MATERIAL.publizonEbook.title,
            publishersName: "Jentas"
          }
        },
        {
          orderId: "1a4c9e73-2b58-4f16-8d0a-6e3b7c5f9d21",
          orderNumber: "7d2f8b19-4a6c-4e35-b7f0-9c1d5a8e2b64",
          orderDateUtc: "2022-10-16T06:32:30Z",
          loanExpireDateUtc: "2022-10-26T06:32:30Z",
          isSubscriptionLoan: false,
          fileExtensionType: 1,
          libraryBook: {
            identifier: MATERIAL.publizonAudiobook.isbn,
            identifierType: 15,
            title: MATERIAL.publizonAudiobook.title,
            publishersName: "Lindhardt og Ringhof"
          }
        }
      ]
    })
  }).as("publizonLoans");

  // Given: two new loans created through the service layer. The loan ids
  // are pinned so the navigation tests can recognise them.
  givenUserHasBiblioLoans([
    biblioLoanFactory.build({ id: BIBLIO_EBOOK_LOAN_ID }),
    biblioAudiobookLoanFactory.build({ id: BIBLIO_AUDIOBOOK_LOAN_ID })
  ]);

  // Given: Biblio does not know Publizon's materials. Nothing should ever
  // ask it; the stubs exist so the test can assert the request never
  // happens.
  givenMaterialIsNotInBiblio(MATERIAL.publizonEbook.isbn);
  givenMaterialIsNotInBiblio(MATERIAL.publizonAudiobook.isbn);

  // Biblio knows its own materials, and is not asked about those either.
  givenMaterialIsInBiblio({
    isbn: MATERIAL.digitalEbookQuota.isbn,
    title: MATERIAL.digitalEbookQuota.title
  });
  givenMaterialIsInBiblio({
    isbn: MATERIAL.biblioAudiobook.isbn,
    title: MATERIAL.biblioAudiobook.title,
    materialType: "audiobook"
  });

  cy.intercept("GET", `**/v1/products/${MATERIAL.publizonEbook.isbn}*`, {
    statusCode: 200,
    body: publizonProductFactory.build({
      product: {
        title: MATERIAL.publizonEbook.title,
        productType: 1,
        externalProductId: { idType: 15, id: MATERIAL.publizonEbook.isbn },
        publisher: "Jentas",
        publicationDate: "2016-05-12T00:00:00Z",
        contributors: [
          { type: "A01", firstName: "Jussi", lastName: "Adler-Olsen" }
        ]
      }
    })
  }).as("publizonProductEbook");

  cy.intercept("GET", `**/v1/products/${MATERIAL.publizonAudiobook.isbn}*`, {
    statusCode: 200,
    body: publizonProductFactory.build({
      product: {
        title: MATERIAL.publizonAudiobook.title,
        productType: 2,
        externalProductId: {
          idType: 15,
          id: MATERIAL.publizonAudiobook.isbn
        },
        publisher: "Lindhardt og Ringhof",
        publicationDate: "2014-11-07T00:00:00Z",
        contributors: [
          { type: "A01", firstName: "Agatha", lastName: "Christie" }
        ]
      }
    })
  }).as("publizonProductAudiobook");

  // The details modal asks DBC Gateway for the material behind the loan.
  // Registered before the specific operations below so those still win.
  cy.intercept("POST", "**/next/graphql*", {
    statusCode: 200,
    body: { data: null }
  });

  cy.interceptGraphql({
    operationName: "GetCoversByPids",
    fixtureFilePath: "cover/cover.json"
  });
  cy.interceptGraphql({
    operationName: "GetBestRepresentationPidByIsbn",
    fixtureFilePath: "cover/cover-get-best-representation-by-isbn.json"
  });
};

describe("Loan list journey - Publizon and Biblio side by side", () => {
  let loanList: LoanListPage;

  beforeEach(() => {
    stubBackends();
    loanList = new LoanListPage(loanListStory.withBiblioAdapter);

    // When: the user opens the loan list
    loanList.visit([]);
    cy.wait(["@publizonLoans", "@biblioLoans"]);
  });

  it("Shows the loans from both providers as one digital list", () => {
    // Then: a single count covers both providers
    loanList.elements
      .digitalLoansHeader()
      .should("have.text", "Digital loans4");

    loanList.elements
      .digitalLoanContainer()
      .find(".list-reservation")
      .should("have.length", 4);

    // And: every loan is present regardless of which provider it came from,
    // each in the row its due date puts it in
    Object.values(MATERIAL).forEach(({ title, row }) => {
      loanList.components.DigitalLoanRow(
        (r) => r.elements.title().should("have.text", title),
        row
      );
    });
  });

  it("Opens a Biblio loan in the reader by its loan id, not an order id", () => {
    // Publizon's reader opens by order id, the WeDoBooks reader by loan id -
    // a swapped parameter is invisible until a patron gets an empty reader.
    // Stubbed so the click can navigate without unloading the storybook iframe.
    cy.intercept("GET", "**/reader?loanid=*", {
      statusCode: 200,
      body: "<html><body>reader</body></html>",
      headers: { "content-type": "text/html" }
    }).as("readerNavigation");

    loanList.components.DigitalLoanRow(
      (row) => row.elements.readerButton().click(),
      MATERIAL.digitalEbookQuota.row
    );

    cy.wait("@readerNavigation")
      .its("request.url")
      .should(
        "include",
        `/reader?loanid=${encodeURIComponent(BIBLIO_EBOOK_LOAN_ID)}`
      );
  });

  it("Plays a Biblio audiobook on the player page, not in Publizon's modal", () => {
    // The SDK's player bar cannot live in a modal - it pins itself to the
    // bottom of the viewport - so LYT navigates to the player page, which
    // opens the loan by its own id.
    cy.intercept("GET", "**/player?loanid=*", {
      statusCode: 200,
      body: "<html><body>player</body></html>",
      headers: { "content-type": "text/html" }
    }).as("playerNavigation");

    loanList.components.DigitalLoanRow(
      (row) => row.elements.playerButton().click(),
      MATERIAL.biblioAudiobook.row
    );

    cy.wait("@playerNavigation")
      .its("request.url")
      .should(
        "include",
        `/player?loanid=${encodeURIComponent(BIBLIO_AUDIOBOOK_LOAN_ID)}`
      );
  });

  it("Reads a Biblio loan from the title, author and dates the contract requires", () => {
    loanList.components.DigitalLoanRow((row) => {
      // Then: the author comes from the loan itself, formatted like any
      // other material
      row.elements
        .author()
        .should("contain", MATERIAL.digitalEbookQuota.author);
      // And: 19 Oct 2022 → 16 Nov 2022, seen from 21 Oct
      row.elements.dueDate().should("have.text", "Due date 16-11-2022 08:15");
      row.elements.daysLeft().should("have.text", "26 days");
      row.elements.materialType().first().should("have.text", "E-book");
    }, MATERIAL.digitalEbookQuota.row);
  });

  it("Warns about the Biblio loan that is due soon", () => {
    // The audiobook runs out 24 Oct 19:40, seen from 21 Oct 10:00. The
    // remaining time is rounded up, so a bit over three days reads as four.
    loanList.components.DigitalLoanRow((row) => {
      row.elements.daysLeft().should("have.text", "4 days");
      row.elements.dueDate().should("have.text", "Due date 24-10-2022 19:40");
    }, MATERIAL.biblioAudiobook.row);
  });

  it("Opens the details of a Biblio loan", () => {
    // Then: no modal is open to begin with. Asserted through the raw selector
    // because the page object's container() waits for the element to exist.
    cy.get(loanDetailsModalSelector).should("not.exist");

    // When: the user asks for the details of the Biblio e-book. A digital
    // loan opens its details from a button, unlike a physical loan whose
    // title is the clickable element.
    loanList
      .digitalLoanRow(MATERIAL.digitalEbookQuota.row)
      .elements.loanDetailsButton()
      .click();

    // Then: the modal describes the material from the loan alone - no
    // metadata was fetched for it.
    const modal = loanList.detailsModal();
    modal.container().should("be.visible");
    modal.elements
      .title()
      .should("have.text", MATERIAL.digitalEbookQuota.title);
    modal.elements.materialType().should("have.text", "E-book");
    // Authors and the publication year share a line: "Sherman, L. (2022)".
    modal.elements
      .authors()
      .should("contain", MATERIAL.digitalEbookQuota.author);
    modal.elements.authors().should("contain", "2022");
  });

  it("Asks no provider more than it has to when describing the list", () => {
    // A "never requested" assertion passes trivially before the request would
    // have been made, so wait for the list to finish describing itself first.
    loanList.elements
      .digitalLoanContainer()
      .find(".list-reservation")
      .should("have.length", 4);
    cy.get("@publizonProductEbook.all").should("have.length.greaterThan", 0);
    cy.get("@publizonProductAudiobook.all").should(
      "have.length.greaterThan",
      0
    );

    // A Biblio loan is never looked up - it carries what the row renders.
    cy.get(`@biblioMetadata_${MATERIAL.digitalEbookQuota.isbn}.all`).should(
      "have.length",
      0
    );
    cy.get(`@biblioMetadata_${MATERIAL.biblioAudiobook.isbn}.all`).should(
      "have.length",
      0
    );

    // Nor is Biblio asked about a Publizon loan. Probing first would cost a
    // 404 per row, and once both providers carry the same isbn - the normal
    // case during a transition - would describe an old Publizon loan with
    // Biblio's metadata.
    cy.get(`@biblioMetadataMissing_${MATERIAL.publizonEbook.isbn}.all`).should(
      "have.length",
      0
    );
    cy.get(
      `@biblioMetadataMissing_${MATERIAL.publizonAudiobook.isbn}.all`
    ).should("have.length", 0);
  });
});

/**
 * The same user at a library that has not enabled the flag. The adapter must
 * not be contacted at all - neither for loans nor for metadata - and the two
 * Publizon loans are all that is left.
 */
describe("Loan list - Biblio adapter feature flag off", () => {
  let loanList: LoanListPage;

  beforeEach(() => {
    stubBackends();
    loanList = new LoanListPage(loanListStory.default);

    // When: the user opens the loan list without the flag
    loanList.visit([]);
    cy.wait("@publizonLoans");
  });

  it("Lists only the Publizon loans", () => {
    // Then: the two Biblio loans are gone, and with them two of the four rows
    loanList.elements
      .digitalLoansHeader()
      .should("have.text", "Digital loans2");

    // The rows renumber without the Biblio loans: audiobook 26 Oct, then
    // e-book 8 Nov - so MATERIAL's own `row` no longer applies here.
    loanList.components.DigitalLoanRow(
      (row) =>
        row.elements.title().should("have.text", MATERIAL.publizonEbook.title),
      1
    );
  });

  it("Never contacts the adapter", () => {
    // Wait for Publizon to have described its own materials, so a count of
    // zero means the adapter was skipped rather than merely not asked yet.
    cy.get("@publizonProductEbook.all").should("have.length.greaterThan", 0);

    cy.get("@biblioLoans.all").should("have.length", 0);
    cy.get(`@biblioMetadataMissing_${MATERIAL.publizonEbook.isbn}.all`).should(
      "have.length",
      0
    );
  });
});
