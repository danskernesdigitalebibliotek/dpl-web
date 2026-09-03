import {
  MaterialPage,
  materialStory
} from "../../../cypress/page-objects/material/MaterialPage";
import { onlineLoanModalSelector } from "../../../cypress/page-objects/material/components/modal-online-loan";
import {
  CanLoanResponseType,
  LoanProvider
} from "@danskernesdigitalebibliotek/dpl-service-layer/biblio/contract";
import {
  BIBLIO_ORG_ID,
  biblioLoanFactory,
  biblioOfferedReservationFactory,
  biblioReservationFactory
} from "../../../cypress/factories/biblio/biblio.factory";
import {
  givenBiblioAcceptsOffer,
  givenBiblioCanLoan,
  givenBiblioCancelsReservation,
  givenBiblioCreatesLoan,
  givenBiblioCreatesReservation,
  givenMaterialIsInBiblio,
  givenUserHasBiblioLoanQuotas,
  givenUserHasBiblioLoans,
  givenUserHasBiblioReservations,
  givenUserHasNoBiblioLoans,
  givenUserHasNoBiblioReservations
} from "../../../cypress/intercepts/biblio/biblio";
import { ContentLoanStatusEnum } from "../../core/publizon/model";
import { stubMaterialPageBackends } from "../../../cypress/intercepts/material-page";
import {
  buildGetMaterialResponse,
  materialFactory
} from "../../../cypress/factories/material/material.factory";
import { onlineAudioBookManifestation } from "../../../cypress/factories/manifestation/variants/onlineAudioBookManifestation";

/**
 * Borrowing and reserving a digital material through the Biblio adapter.
 *
 * This is the write path of the transition: with the flag on, a new loan or
 * reservation must be created in Biblio rather than Publizon, the quota shown
 * while confirming has to be Biblio's too, and an offer the user already
 * holds must be accepted rather than borrowed anew.
 *
 * All Biblio bodies come from the factories typed against the generated
 * contract client, so a response that drifts from
 * `schemas/openapi/biblio-adapter.yaml` fails to typecheck.
 */

// The ISBN of the e-book edition in the default material factory.
const EBOOK_ISBN = "9788702441000";

// Ids the adapter cancels and opens loans by - deliberately not the ISBN,
// which is what Publizon uses for both.
const BIBLIO_RESERVATION_ID = "e5b4bbd1-6d63-4a24-9a25-2f0f4e9b1f11";
const BIBLIO_LOAN_ID = "3f7b1c62-9d4e-4a71-b0c3-1d5a8e2f4b90";
const PUBLIZON_ORDER_ID = "082bb01a-8979-424b-93a6-7cc7081f8a45";

const stubBackends = (
  publizonLoanStatus: ContentLoanStatusEnum = ContentLoanStatusEnum.NUMBER_4
) => {
  stubMaterialPageBackends(publizonLoanStatus);

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

  // Given: Biblio provides this material and will let the user borrow it
  givenMaterialIsInBiblio({ isbn: EBOOK_ISBN, title: "De syv søstre" });
  givenBiblioCanLoan();
  givenUserHasBiblioLoanQuotas();
  givenUserHasNoBiblioLoans();
  givenUserHasNoBiblioReservations();
  givenBiblioCreatesLoan();
};

const openLoanModal = (material: MaterialPage) => {
  material.visit([]);
  // The e-book edition is reached from the availability labels.
  cy.getBySel("availability-label").contains("e-bog").first().click();
  // The header button opens the modal; the one inside it creates the loan.
  cy.getBySel("material-header-buttons-online-internal-reader").first().click();
};

describe("Material page - borrowing through the Biblio adapter", () => {
  beforeEach(() => stubBackends());

  it("Shows Biblio's quota while confirming the loan", () => {
    const material = new MaterialPage(materialStory.withBiblioAdapter, "e-bog");

    // When: the user opens the confirm-loan modal
    openLoanModal(material);

    // Then: the quota comes from the adapter - 3 of 10 e-books this month,
    // from the split quota factory - rather than from Publizon.
    material
      .onlineLoanModal()
      .elements.quotaText()
      .should("contain", "3")
      .and("contain", "10");
  });

  it("Calls a blue title included instead of counting it", () => {
    // Given: Biblio would lend this material under the "selection" licence -
    // the one Danish blue titles answer with. Such a loan draws on no quota.
    givenBiblioCanLoan(CanLoanResponseType.loanable, LoanProvider.selection);

    const material = new MaterialPage(materialStory.withBiblioAdapter, "e-bog");
    openLoanModal(material);

    // Then: the ordinary "x of y this month" line gives way to the promise
    // that the material is included.
    material
      .onlineLoanModal()
      .elements.quotaText()
      .should("contain", "doesn't count towards your loan quota");
  });

  it("Creates the loan in Biblio, not in Publizon", () => {
    const material = new MaterialPage(materialStory.withBiblioAdapter, "e-bog");

    openLoanModal(material);

    // When: the user approves the loan
    material.onlineLoanModal().elements.approveButton().click();

    // Then: the request went to the adapter, carrying the ISBN as material_id
    cy.wait("@biblioCreateLoan")
      .its("request.body")
      .should("deep.equal", { material_id: EBOOK_ISBN });
  });

  it("Confirms the loan with the expiry date the adapter returned", () => {
    // A loan that runs until a date we can recognise on screen.
    givenBiblioCreatesLoan(
      biblioLoanFactory.build({
        material_id: EBOOK_ISBN,
        end: "2026-12-24T10:00:00.000Z"
      })
    );

    const material = new MaterialPage(materialStory.withBiblioAdapter, "e-bog");
    openLoanModal(material);
    material.onlineLoanModal().elements.approveButton().click();
    cy.wait("@biblioCreateLoan");

    // Then: the success message quotes the adapter's own end date
    material
      .onlineLoanModal()
      .elements.responseStatus()
      .should("contain", "24");
  });

  it("Does not report success when the adapter declines the loan", () => {
    // The adapter answers 201 but without a loan, eg. a quota is spent.
    cy.intercept("POST", "**/v1/loans", {
      statusCode: 201,
      body: {
        status: "monthly_limit_exceeded",
        org_id: BIBLIO_ORG_ID
      }
    }).as("biblioCreateLoanDeclined");

    const material = new MaterialPage(materialStory.withBiblioAdapter, "e-bog");
    openLoanModal(material);
    material.onlineLoanModal().elements.approveButton().click();
    cy.wait("@biblioCreateLoanDeclined");

    // A request the adapter accepts but does not fulfil must read as a
    // failure. Asserted on the error state itself: asserting the absence of
    // a success phrase passes trivially when the phrase is misremembered.
    cy.get(onlineLoanModalSelector)
      .should("contain", "Something went wrong.")
      .and("not.contain", "You have now borrowed");
  });

  it("Leaves the adapter alone when the flag is off", () => {
    // Publizon's create-loan endpoint, stubbed so the loan the click DOES
    // create can be awaited - a count of zero only means anything after the
    // work it is counting against has finished.
    cy.intercept("POST", "**/v1/user/loans/**", {
      statusCode: 200,
      body: { orderId: PUBLIZON_ORDER_ID, code: 101, message: "OK" }
    }).as("publizonCreateLoan");

    const material = new MaterialPage(materialStory.default, "e-bog");

    openLoanModal(material);
    material.onlineLoanModal().elements.approveButton().click();

    // Publizon stays in charge until a library opts in.
    cy.wait("@publizonCreateLoan");
    cy.get("@biblioCreateLoan.all").should("have.length", 0);
    cy.get(`@biblioMetadata_${EBOOK_ISBN}.all`).should("have.length", 0);
  });

  it("Accepts an offer the user already holds instead of borrowing again", () => {
    // Given: the user has a reservation for this material that Biblio has
    // offered to them.
    givenUserHasBiblioReservations([
      biblioOfferedReservationFactory.build({ material_id: EBOOK_ISBN })
    ]);
    givenBiblioAcceptsOffer();

    const material = new MaterialPage(materialStory.withBiblioAdapter, "e-bog");
    openLoanModal(material);

    // When: the user borrows it
    material.onlineLoanModal().elements.approveButton().click();

    // Then: the offer is redeemed rather than a second loan created. Publizon
    // has no equivalent step - there a redeemable reservation simply shows
    // the loan button - so this branch exists only for Biblio.
    cy.wait("@biblioAcceptOffer").its("request.body").should("deep.equal", {
      offer_id: "9a1c7f30-4d62-4e18-b5a7-2c8e6f0b3d94"
    });

    // And: the user is told it worked. Accepting an offer answers with the
    // loan id only, so the confirmation has no expiration date to show.
    cy.get(onlineLoanModalSelector).should("contain", "You have now borrowed");

    cy.get("@biblioCreateLoan.all").should("have.length", 0);
  });

  it("Does not report success when the offer can no longer be accepted", () => {
    givenUserHasBiblioReservations([
      biblioOfferedReservationFactory.build({ material_id: EBOOK_ISBN })
    ]);
    // The adapter answers 200 but declines, eg. the offer expired meanwhile.
    givenBiblioAcceptsOffer(false);

    const material = new MaterialPage(materialStory.withBiblioAdapter, "e-bog");
    openLoanModal(material);
    material.onlineLoanModal().elements.approveButton().click();
    cy.wait("@biblioAcceptOffer");

    cy.get(onlineLoanModalSelector)
      .should("contain", "Something went wrong.")
      .and("not.contain", "You have now borrowed");
  });
});

describe("Material page - reserving with the flag off", () => {
  beforeEach(() => {
    // Without the flag Publizon's loan status is still what decides, and 5
    // means the material can only be queued for.
    stubBackends(ContentLoanStatusEnum.NUMBER_5);
    givenBiblioCreatesReservation();

    cy.intercept("POST", "**/v1/user/reservations/**", {
      statusCode: 200,
      body: { code: 101, message: "OK" }
    }).as("publizonCreateReservation");
  });

  it("Reserves through Publizon and leaves the adapter alone", () => {
    const material = new MaterialPage(materialStory.default, "e-bog");

    openLoanModal(material);
    material.onlineLoanModal().elements.approveButton().click();

    // Publizon takes contact details to notify the user with; the adapter
    // derives the user from the token and needs none.
    cy.wait("@publizonCreateReservation")
      .its("request.url")
      .should("contain", EBOOK_ISBN);

    cy.get("@biblioCreateReservation.all").should("have.length", 0);
  });
});

/**
 * A material Publizon has never heard of.
 *
 * This is where every digital material ends up once it has moved, and it used
 * to be the one case the transition could not serve: whether the button lends
 * or reserves came from Publizon's loan status alone, so a material only
 * Biblio provides left it stuck on a disabled "Loading". The adapter now
 * answers that question for its own materials.
 */
describe("Material page - a material only Biblio provides", () => {
  beforeEach(() => {
    // Publizon reports the material as unknown - status 0 maps to none of the
    // loanable, reservable or loaned states.
    stubBackends(ContentLoanStatusEnum.NUMBER_0);
  });

  it("Borrows it on the adapter's word alone", () => {
    const material = new MaterialPage(materialStory.withBiblioAdapter, "e-bog");

    openLoanModal(material);
    material.onlineLoanModal().elements.approveButton().click();

    cy.wait("@biblioCreateLoan")
      .its("request.body")
      .should("deep.equal", { material_id: EBOOK_ISBN });
  });

  it("Offers to reserve it when the adapter says it is queued", () => {
    // The material is not free right now, so the button has to offer the queue
    // rather than a loan - a distinction Publizon can no longer make here.
    givenBiblioCanLoan(CanLoanResponseType.reservable);
    givenBiblioCreatesReservation();

    const material = new MaterialPage(materialStory.withBiblioAdapter, "e-bog");

    openLoanModal(material);
    material.onlineLoanModal().elements.approveButton().click();

    cy.wait("@biblioCreateReservation")
      .its("request.body")
      .should("deep.equal", { material_id: EBOOK_ISBN });
    cy.get("@biblioCreateLoan.all").should("have.length", 0);
  });

  it("Does not tell the user they are queued when the adapter declines", () => {
    // The adapter answers 201 with a decision rather than an HTTP error, so
    // the status is the only thing separating a queue place from a spent
    // quota - the same trap as the declined loan above, on the other endpoint.
    givenBiblioCanLoan(CanLoanResponseType.reservable);
    cy.intercept("POST", "**/v1/reservations", {
      statusCode: 201,
      body: {
        status: "monthly_limit_exceeded",
        org_id: BIBLIO_ORG_ID
      }
    }).as("biblioCreateReservationDeclined");

    const material = new MaterialPage(materialStory.withBiblioAdapter, "e-bog");

    openLoanModal(material);
    material.onlineLoanModal().elements.approveButton().click();
    cy.wait("@biblioCreateReservationDeclined");

    // Asserted on the error state itself: asserting the absence of a success
    // phrase passes trivially when the phrase is misremembered.
    cy.get(onlineLoanModalSelector)
      .should("contain", "Something went wrong.")
      .and("not.contain", "reserved for you");
  });

  it("Lets the user cancel a reservation they are queued for", () => {
    // A queued reservation replaces the loan button with a cancel button, and
    // it has to be the adapter's reservation id that is cancelled.
    givenBiblioCanLoan(CanLoanResponseType.reservable);
    givenUserHasBiblioReservations([
      biblioReservationFactory.build({
        id: BIBLIO_RESERVATION_ID,
        material_id: EBOOK_ISBN
      })
    ]);
    givenBiblioCancelsReservation();

    const material = new MaterialPage(materialStory.withBiblioAdapter, "e-bog");
    material.visit([]);
    cy.getBySel("availability-label").contains("e-bog").first().click();

    cy.getBySel("remove-digital-reservation-button").first().click();
    cy.getBySel("delete-reservation-button").click();

    cy.wait("@biblioCancelReservation")
      .its("request.url")
      .should("contain", `/v1/reservations/${BIBLIO_RESERVATION_ID}`);
  });

  it("Offers to read a loan the user already holds rather than borrow it again", () => {
    givenUserHasBiblioLoans([
      biblioLoanFactory.build({
        id: BIBLIO_LOAN_ID,
        material_id: EBOOK_ISBN
      })
    ]);

    const material = new MaterialPage(materialStory.withBiblioAdapter, "e-bog");
    material.visit([]);
    cy.getBySel("availability-label").contains("e-bog").first().click();

    // Publizon reports this material as unknown, so recognising the loan can
    // only have come from the adapter's own loan list.
    cy.getBySel("material-header-buttons-online-internal-reader")
      .first()
      .should("contain", "Read e-bog");

    cy.get("@biblioCreateLoan.all").should("have.length", 0);
  });

  it("Still leaves the adapter alone when the flag is off", () => {
    // Without the flag the material stays unreachable, which is correct: the
    // library has not opted in, so Publizon is still the only provider.
    const material = new MaterialPage(materialStory.default, "e-bog");

    material.visit([]);
    cy.getBySel("availability-label").contains("e-bog").first().click();

    // Publizon's answer is the signal that the page finished asking around;
    // the disabled Loading button alone is also what the page shows before
    // anything has been asked at all.
    cy.wait("@publizonLoanStatus");
    cy.contains("button", "Loading").should("be.disabled");
    cy.get("@biblioCanLoan.all").should("have.length", 0);
  });
});

/**
 * The adapter refuses, and Publizon would not have.
 *
 * A library that switched provider has decided to stop lending through
 * Publizon, so a refusal must stand rather than be quietly routed there -
 * that would keep pulling new loans into the service being migrated away
 * from. The material is simply not offered.
 *
 * The refusal used here is a spent quota on purpose: the material itself is
 * still "available", so the availability label stays green and the ONLY thing
 * withholding the button is the rule that the adapter decides. A material the
 * adapter does not have at all would also read as unavailable, which would
 * hide the button for a second reason and make the test prove less.
 */
describe("Material page - flag on, the adapter refuses the loan", () => {
  beforeEach(() => {
    stubBackends();
    // Publizon would lend it - the default loan status is 4.
    givenBiblioCanLoan(CanLoanResponseType.monthly_limit_exceeded);

    cy.intercept("POST", "**/v1/user/loans/**", {
      statusCode: 200,
      body: { orderId: "publizon-order-1", code: 101, message: "OK" }
    }).as("publizonCreateLoan");
  });

  it("Neither offers the loan nor borrows it from Publizon", () => {
    const material = new MaterialPage(materialStory.withBiblioAdapter, "e-bog");

    material.visit([]);
    cy.getBySel("availability-label").contains("e-bog").first().click();

    // The material is not the problem, the user's quota is - so it stays
    // available while the loan is withheld.
    cy.getBySel("availability-label").first().should("contain", "Available");

    // Wait for the refusal itself. Until it lands the page still shows the
    // disabled "Loading" button, and asserting on the buttons before then
    // would pass on the spinner rather than on the answer.
    cy.wait("@biblioCanLoan");

    // The button stays, but cannot be used: a refusal has to read as "not
    // offered" rather than as "still loading", which is what an unanswered
    // page looks like.
    cy.getBySel("material-header-buttons-online-internal-reader")
      .first()
      .should("be.disabled");

    cy.get("@publizonCreateLoan.all").should("have.length", 0);
    cy.get("@biblioCreateLoan.all").should("have.length", 0);
  });
});

/**
 * A loan the user made before the library switched provider.
 *
 * It lives in Publizon and has to keep working: the old reader opens it from
 * Publizon's order id, and the adapter knows nothing about it.
 */
describe("Material page - flag on, an older Publizon loan", () => {
  beforeEach(() => {
    // Publizon holds a loan for this material; the adapter holds none.
    stubBackends(ContentLoanStatusEnum.NUMBER_1);
    givenUserHasNoBiblioLoans();

    cy.intercept("GET", "**/v1/user/loans**", {
      statusCode: 200,
      body: {
        loans: [
          {
            orderId: PUBLIZON_ORDER_ID,
            orderNumber: "0c5a287f-be96-4a68-a85a-453864b330cd",
            orderDateUtc: "2022-10-11T06:32:30Z",
            loanExpireDateUtc: "2026-11-08T06:32:30Z",
            isSubscriptionLoan: false,
            fileExtensionType: 3,
            libraryBook: {
              identifier: EBOOK_ISBN,
              identifierType: 15,
              title: "De syv søstre",
              publishersName: "Jentas"
            }
          }
        ],
        userData: {},
        libraryData: {}
      }
    }).as("publizonUserLoans");
  });

  it("Still opens in the old reader", () => {
    const material = new MaterialPage(materialStory.withBiblioAdapter, "e-bog");

    material.visit([]);
    cy.getBySel("availability-label").contains("e-bog").first().click();

    // The button reads rather than borrows, and it does so from Publizon's
    // order id - the adapter has no record of this loan.
    cy.getBySel("material-header-buttons-online-internal-reader")
      .first()
      .should("contain", "Read e-bog");

    cy.get("@biblioCreateLoan.all").should("have.length", 0);
  });
});

/**
 * The audiobook twin of the describe above: an older Publizon loan must keep
 * playing in Publizon's modal player. A Biblio loan gets a player PAGE
 * instead, so the modal path is exactly what the provider split must not
 * break for the loans made before the switch.
 */
describe("Material page - flag on, an older Publizon audiobook loan", () => {
  const AUDIOBOOK_ISBN = "9788763850637";

  beforeEach(() => {
    // Publizon holds an audiobook loan for this material; the adapter none.
    stubBackends(ContentLoanStatusEnum.NUMBER_1);

    // The default work has no streamed audiobook edition, so one is added.
    // Registered after stubBackends so this material wins - Cypress matches
    // the most recently registered route first.
    const material = materialFactory.build();
    material.work?.manifestations.all.push(onlineAudioBookManifestation);
    cy.interceptGraphql({
      operationName: "getMaterial",
      body: buildGetMaterialResponse(material)
    });

    cy.intercept("GET", "**/v1/user/loans**", {
      statusCode: 200,
      body: {
        loans: [
          {
            orderId: PUBLIZON_ORDER_ID,
            orderNumber: "0c5a287f-be96-4a68-a85a-453864b330cd",
            orderDateUtc: "2022-10-11T06:32:30Z",
            loanExpireDateUtc: "2026-11-08T06:32:30Z",
            isSubscriptionLoan: false,
            fileExtensionType: 1,
            libraryBook: {
              identifier: AUDIOBOOK_ISBN,
              identifierType: 15,
              title: "De syv søstre (online)",
              publishersName: "Rosinante"
            }
          }
        ],
        userData: {},
        libraryData: {}
      }
    }).as("publizonUserLoans");
  });

  it("Still plays in Publizon's modal, not on the player page", () => {
    const material = new MaterialPage(
      materialStory.withBiblioAdapter,
      "lydbog (online)"
    );

    material.visit([]);
    cy.getBySel("availability-label").contains("lydbog (online)").click();

    // When: the user asks to listen
    cy.getBySel("material-header-buttons-online-internal-player")
      .first()
      .click();

    // Then: the loan opens in the modal - the positive proof that the
    // provider split routed a Publizon holding to Publizon's player. A Biblio
    // loan would have navigated away to the player page instead.
    cy.getBySel("player-modal").should("be.visible");

    cy.get("@biblioCreateLoan.all").should("have.length", 0);
  });
});
