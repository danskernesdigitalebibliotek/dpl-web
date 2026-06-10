import { LoanListPage } from "../../../../cypress/page-objects/loan-list/LoanListPage";
import {
  givenUserHasDigitalEbookLoan,
  givenUserHasDigitalAudiobookLoan,
  givenUserHasDigitalPodcastLoan
} from "../../../../cypress/intercepts/publizon/publizon";
import { givenUserHasPhysicalLoan } from "../../../../cypress/intercepts/fbs/fbs";
import { givenManifestationByFaust } from "../../../../cypress/intercepts/fbi/manifestation";
import { TOKEN_LIBRARY_KEY } from "../../../core/token";

type StubOptions = {
  emptyDigital?: boolean;
  emptyPhysical?: boolean;
  stubFbiGateway?: boolean;
};

const stubLoanListBackends = ({
  emptyDigital = false,
  emptyPhysical = true,
  stubFbiGateway = true
}: StubOptions = {}) => {
  cy.window().then((win) => {
    win.sessionStorage.setItem(TOKEN_LIBRARY_KEY, "random-token");
  });

  cy.intercept("GET", "**/external/agencyid/patrons/patronid/v4**", {
    patron: { blockStatus: null }
  });

  // By default no physical loans, so the digital flow can be exercised in
  // isolation. Tests that need physical loans pass `emptyPhysical: false`
  // and follow up with `givenUserHasPhysicalLoan(...)`.
  if (emptyPhysical) {
    cy.intercept("GET", "**/external/agencyid/patrons/patronid/loans/v2**", {
      statusCode: 200,
      body: []
    }).as("physicalLoans");
  }

  // Reservations endpoint returns an empty list so the loan list mounts cleanly.
  cy.intercept("GET", "**/v1/user/reservations**", {
    statusCode: 200,
    body: { reservations: [], code: 101, message: "OK" }
  });

  if (stubFbiGateway) {
    // DBC Gateway is not relevant for the digital flow — stub it out.
    cy.intercept("POST", "**/next/graphql", {
      statusCode: 200,
      body: { data: null }
    });
    cy.intercept("POST", "**/next-present/graphql", {
      statusCode: 200,
      body: { data: null }
    });
  }

  if (emptyDigital) {
    cy.intercept("GET", "**/v1/user/loans**", {
      statusCode: 200,
      body: { loans: [], code: 101, message: "OK" }
    }).as("publizonUserLoansEmpty");
  }
};

describe("Loan list page", () => {
  let loanList: LoanListPage;

  beforeEach(() => {
    loanList = new LoanListPage();
  });

  describe("Digital launch buttons", () => {
    beforeEach(() => stubLoanListBackends());

    it("Shows the LÆS button on an ebook digital loan and hides LYT", () => {
      // Given: the user has a digital ebook loan
      givenUserHasDigitalEbookLoan();

      // When: visiting the loan list
      loanList.visit([]);

      // Then: the reader (LÆS) button is visible and the player (LYT) button is absent
      loanList.components.DigitalLoanRow((row) => {
        row.elements.readerButton().should("be.visible");
        row.elements.playerButton().should("not.exist");
      });
    });

    it("Shows the LYT button on a podcast digital loan", () => {
      // Given: the user has a digital podcast loan
      givenUserHasDigitalPodcastLoan();

      // When: visiting the loan list
      loanList.visit([]);

      // Then: the player (LYT) button is visible and the reader (LÆS) button is absent
      loanList.components.DigitalLoanRow((row) => {
        row.elements.playerButton().should("be.visible");
        row.elements.readerButton().should("not.exist");
      });
    });

    it("Navigates LÆS to the reader URL carrying the orderId", () => {
      // Given: the user has a digital ebook loan with a known orderId
      const orderId = "1f7e02d1-aa11-4b22-9c33-abcdef012345";
      givenUserHasDigitalEbookLoan({ orderId });

      // Stub the reader route so the LÆS click can navigate without actually
      // unloading the storybook iframe.
      cy.intercept("GET", "**/reader?orderid=*", {
        statusCode: 200,
        body: "<html><body>reader</body></html>",
        headers: { "content-type": "text/html" }
      }).as("readerNavigation");

      // When: visiting the loan list and clicking the LÆS button
      loanList.visit([]);
      loanList.components.DigitalLoanRow((row) =>
        row.elements.readerButton().click()
      );

      // Then: the navigation goes to the reader URL with the loan's orderId
      cy.wait("@readerNavigation")
        .its("request.url")
        .should("include", `/reader?orderid=${encodeURIComponent(orderId)}`);
    });
  });

  describe("Player modal", () => {
    beforeEach(() => stubLoanListBackends());

    it("Opens the player modal when clicking LYT on an audiobook digital loan", () => {
      // Given: the user has a digital audiobook loan
      givenUserHasDigitalAudiobookLoan();

      // When: visiting the loan list
      loanList.visit([]);

      // Then: the player modal is not visible yet
      cy.get("[data-cy='player-modal']").should("not.exist");

      // When: clicking the LYT button
      loanList.components.DigitalLoanRow((row) =>
        row.elements.playerButton().should("be.visible").click()
      );

      // Then: the player modal is shown
      loanList.playerModal().container().should("be.visible");
    });

    it("Portals the player modal to document.body, outside the loan list", () => {
      // Given: the user has a digital audiobook loan
      givenUserHasDigitalAudiobookLoan();

      // When: visiting the loan list and opening the player
      loanList.visit([]);
      loanList.components.DigitalLoanRow((row) =>
        row.elements.playerButton().click()
      );

      // Then: the modal mounts as a direct child of <body> rather than nested
      // inside the list-reservation-container (which would re-trap it in a
      // parent stacking context — the regression the portal commit fixed).
      loanList
        .playerModal()
        .container()
        .should("be.visible")
        .parents(".list-reservation-container")
        .should("not.exist");
    });
  });

  describe("Loan details modal", () => {
    beforeEach(() => stubLoanListBackends());

    it("Opens the loan details modal from a digital loan row", () => {
      // Given: the user has a digital ebook loan
      givenUserHasDigitalEbookLoan();

      // When: visiting the loan list
      loanList.visit([]);

      // Then: the details modal is not visible yet
      cy.get(".modal-details").should("not.exist");

      // When: clicking the "Loan details" button on the digital loan row
      loanList.components.DigitalLoanRow((row) =>
        row.elements.loanDetailsButton().click()
      );

      // Then: the details modal is shown and titled after the digital loan
      const detailsModal = loanList.detailsModal();
      detailsModal.container().should("be.visible");
      detailsModal.elements.title().should("contain", "Caribisk rom");
    });
  });

  describe("Digital loan row content", () => {
    beforeEach(() => stubLoanListBackends());

    it("Renders title, material type, author and due date for an ebook", () => {
      // Given: a digital ebook loan with fixture data from the factory
      givenUserHasDigitalEbookLoan();

      // When: visiting the loan list
      loanList.visit([]);

      // Then: the digital row exposes the expected metadata
      loanList.components.DigitalLoanRow((row) => {
        row.elements.title().should("contain", "Caribisk rom");
        row.elements.materialType().should("contain.text", "E-book");
        row.elements.author().should("contain", "Test Author");
        row.elements
          .dueDate()
          .invoke("text")
          .should("match", /\d{2}-\d{2}-\d{4}/);
      });
    });
  });

  describe("Empty states", () => {
    it("Shows the combined empty message when the user has no loans at all", () => {
      // Given: the user has neither physical nor digital loans. When both are
      // empty, loan-list.tsx renders a single combined empty list rather than
      // the per-list (digital/physical) empty messages.
      stubLoanListBackends({ emptyDigital: true });

      // When: visiting the loan list
      loanList.visit([]);

      // Then: the combined empty message is shown
      loanList.elements
        .emptyListMessages()
        .should("contain", "You have 0 loans at the moment");
    });

    it("Shows the empty physical loans message when only digital loans exist", () => {
      // Given: the user has only a digital loan (no physical). When at least
      // one list has loans, each empty list shows its own empty message.
      stubLoanListBackends();
      givenUserHasDigitalEbookLoan();

      // When: visiting the loan list
      loanList.visit([]);

      // Then: the physical empty message is shown (alongside the digital row)
      loanList.elements
        .emptyListMessages()
        .should("contain", "You have no physical loans at the moment");
    });
  });

  describe("Physical loans", () => {
    beforeEach(() => {
      // Keep the blanket FBI gateway stub on (returns `{ data: null }`).
      // Cypress evaluates intercepts newest-first and falls through when a
      // handler doesn't reply, so `givenManifestationByFaust()` (registered
      // after) catches the manifestation lookup, and any *other* FBI
      // operation the loan list fires (covers, best-representation lookup,
      // etc.) falls through to the blanket stub instead of escaping to the
      // real backend and 401-ing.
      stubLoanListBackends({ emptyPhysical: false });
      givenManifestationByFaust();
    });

    it("Renders title and due date for a physical loan", () => {
      // Given: the user has a physical loan with a known due date
      givenUserHasPhysicalLoan({
        loanDetails: {
          loanId: 956250508,
          materialItemNumber: "3846990827",
          recordId: "28847238",
          loanDate: "2022-10-16T16:43:25.325",
          dueDate: "2022-10-28",
          loanType: "loan",
          materialGroup: { name: "standard", description: "Standard" }
        }
      });

      // When: visiting the loan list
      loanList.visit([]);

      // Then: the physical row exposes the expected metadata
      loanList.components.PhysicalLoanRow((row) => {
        row.elements.title().should("contain", "Harry Potter");
        row.elements.dueDate().should("contain", "28-10-2022");
      });
    });

    it("Opens the loan details modal from the arrow button on a non-stacked physical row", () => {
      // Given: the user has a single physical loan (not stacked)
      givenUserHasPhysicalLoan({
        loanDetails: {
          loanId: 956250508,
          materialItemNumber: "3846990827",
          recordId: "28847238",
          loanDate: "2022-10-16T16:43:25.325",
          dueDate: "2022-10-28",
          loanType: "loan",
          materialGroup: { name: "standard", description: "Standard" }
        }
      });

      // When: visiting the loan list and clicking the arrow button on the row.
      // The arrow button is wired to `openDetailsModal` directly for
      // non-stacked rows (material-status.tsx). Clicking the title/row
      // instead opens the due-date modal even for a single loan.
      loanList.visit([]);
      cy.get(".modal-details").should("not.exist");
      loanList.components.PhysicalLoanRow((row) =>
        row.elements.arrowButton().click()
      );

      // Then: the details modal opens and is titled after the loan
      const detailsModal = loanList.detailsModal();
      detailsModal.container().should("be.visible");
      detailsModal.elements.title().should("contain", "Harry Potter");
    });
  });
});

export {};
