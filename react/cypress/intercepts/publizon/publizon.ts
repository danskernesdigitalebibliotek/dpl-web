import {
  publizonLoanStatusFactory,
  publizonLoanListFactory,
  publizonProductFactory
} from "../../factories/publizon/publizon.factory";
import {
  ContentLoanStatusEnum,
  FileExtensionType,
  IdentifierTypeEnum
} from "../../../src/core/publizon/model";

/**
 * Given: User has a loaned e-book
 * Sets up intercepts to simulate an e-book that's already loaned by the user
 */
export const givenUserHasLoanedEbook = (options?: {
  orderId?: string;
  identifier?: string;
}) => {
  const orderId = options?.orderId || "58495816-6da7-4ac0-8fbe-db5825922e0a";
  const identifier = options?.identifier || "9788702441000";

  // Show book as loaned in status check
  cy.intercept("GET", "**/v1/loanstatus/**", {
    statusCode: 200,
    body: publizonLoanStatusFactory.build({
      loanStatus: ContentLoanStatusEnum.NUMBER_1, // Loaned
      identifier
    })
  }).as("publizonLoanStatusLoaned");

  // Return the loan in user's loans list
  cy.intercept("GET", "**/v1/user/loans**", {
    statusCode: 200,
    body: publizonLoanListFactory.build({
      loans: [
        {
          orderId,
          orderNumber: "ORD-2025-001",
          orderDateUtc: new Date().toISOString(),
          loanExpireDateUtc: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000
          ).toISOString(),
          isSubscriptionLoan: false,
          fileExtensionType: 3, // epub
          libraryBook: {
            identifier,
            identifierType: 15, // ISBN
            title: "De syv søstre",
            publishersName: "Gyldendal"
          }
        }
      ],
      userData: {
        totalLoans: 1,
        totalEbookLoans: 1,
        totalAudioLoans: 0,
        ebookLoansRemaining: 4,
        audiobookLoansRemaining: 5
      }
    })
  }).as("publizonUserLoansWithLoan");
};

// Fixed Publizon product types (see src/core/publizon/productType.ts) —
// duplicated here so scenario helpers below can be read at a glance.
const PUBLIZON_EBOOK = 1;
const PUBLIZON_AUDIOBOOK = 2;
const PUBLIZON_PODCAST = 4;

type DigitalLoanOverrides = {
  orderId?: string;
  identifier?: string;
};

type DigitalLoanData = {
  orderId: string;
  identifier: string;
  title: string;
  publisher: string;
  productType: number;
  fileExtensionType: FileExtensionType;
  durationInSeconds: number | null;
  format: string;
  totalEbookLoans: number;
  totalAudioLoans: number;
};

// Builds & wires the two Publizon intercepts (`/v1/user/loans` and
// `/v1/products/{id}`) for a single digital loan. Kept private so each
// `givenUserHasDigital*Loan` scenario can stay declarative.
const interceptDigitalLoan = (data: DigitalLoanData) => {
  const nowIso = new Date().toISOString();
  const loanExpireIso = new Date(
    Date.now() + 30 * 24 * 60 * 60 * 1000
  ).toISOString();

  cy.intercept("GET", "**/v1/user/loans**", {
    statusCode: 200,
    body: publizonLoanListFactory.build({
      loans: [
        {
          orderId: data.orderId,
          orderNumber: "00000000-0000-0000-0000-000000000001",
          orderDateUtc: nowIso,
          loanExpireDateUtc: loanExpireIso,
          isSubscriptionLoan: false,
          libraryBook: {
            identifier: data.identifier,
            identifierType: IdentifierTypeEnum.NUMBER_15,
            title: data.title,
            publishersName: data.publisher
          },
          fileExtensionType: data.fileExtensionType
        }
      ],
      userData: {
        totalLoans: 1,
        totalEbookLoans: data.totalEbookLoans,
        totalAudioLoans: data.totalAudioLoans,
        ebookLoansRemaining: 2,
        audiobookLoansRemaining: 2,
        ebookLoanAvailableUtc: nowIso,
        audioLoanAvailableUtc: nowIso,
        friendlyCardNumber: "FAKE01"
      }
    })
  }).as("publizonUserLoansDigital");

  cy.intercept("GET", "**/v1/products/**", {
    statusCode: 200,
    body: publizonProductFactory.build({
      product: {
        title: data.title,
        productType: data.productType,
        externalProductId: { idType: 15, id: data.identifier },
        coverUri: "https://images.pubhub.dk/01/cover.jpg",
        thumbnailUri: "https://images.pubhub.dk/27/cover.jpg",
        format: data.format,
        durationInSeconds: data.durationInSeconds,
        publisher: data.publisher,
        contributors: [{ type: "A01", firstName: "Test", lastName: "Author" }],
        description: "Mock description",
        productCategories: [{ description: "Dansk", code: "2ACSD" }]
      }
    })
  }).as("publizonProductForDigitalLoan");
};

/**
 * Given: User has a single digital **ebook** loan. Renders as LÆS in the
 * loan list. (Publizon productType 1.)
 */
export const givenUserHasDigitalEbookLoan = (
  overrides: DigitalLoanOverrides = {}
) =>
  interceptDigitalLoan({
    orderId: overrides.orderId || "123e4567-e89b-12d3-a456-426614174000",
    identifier: overrides.identifier || "9788740065411",
    title: "Caribisk rom",
    publisher: "JP/Politikens Forlag",
    productType: PUBLIZON_EBOOK,
    fileExtensionType: FileExtensionType.NUMBER_3, // epub
    format: "epub",
    durationInSeconds: null,
    totalEbookLoans: 1,
    totalAudioLoans: 0
  });

/**
 * Given: User has a single digital **audiobook** loan. Renders as LYT in
 * the loan list. (Publizon productType 2.)
 */
export const givenUserHasDigitalAudiobookLoan = (
  overrides: DigitalLoanOverrides = {}
) =>
  interceptDigitalLoan({
    orderId: overrides.orderId || "123e4567-e89b-12d3-a456-426614174000",
    identifier: overrides.identifier || "9788740065411",
    title: "Harry Potter og De Vises Sten",
    publisher: "Pottermore Publishing",
    productType: PUBLIZON_AUDIOBOOK,
    fileExtensionType: FileExtensionType.NUMBER_1,
    format: "zip",
    durationInSeconds: 34865,
    totalEbookLoans: 0,
    totalAudioLoans: 1
  });

/**
 * Given: User has a single digital **podcast** loan. Renders as LYT in
 * the loan list. (Publizon productType 4.)
 */
export const givenUserHasDigitalPodcastLoan = (
  overrides: DigitalLoanOverrides = {}
) =>
  interceptDigitalLoan({
    orderId: overrides.orderId || "123e4567-e89b-12d3-a456-426614174000",
    identifier: overrides.identifier || "9788740065411",
    title: "Genstart",
    publisher: "DR",
    productType: PUBLIZON_PODCAST,
    fileExtensionType: FileExtensionType.NUMBER_1,
    format: "zip",
    durationInSeconds: 34865,
    totalEbookLoans: 0,
    totalAudioLoans: 1
  });

/**
 * Given: User has a reserved e-book
 * Sets up intercepts to simulate an e-book that's reserved by the user
 */
export const givenUserHasReservedEbook = (options?: {
  identifier?: string;
}) => {
  const identifier = options?.identifier || "9788702441000";

  cy.intercept("GET", "**/v1/loanstatus/**", {
    statusCode: 200,
    body: publizonLoanStatusFactory.build({
      loanStatus: ContentLoanStatusEnum.NUMBER_2, // Reserved
      identifier
    })
  }).as("publizonLoanStatusReserved");
};

/**
 * Given: E-book is available to loan
 * Sets up intercepts to simulate an e-book that can be loaned
 */
export const givenEbookIsAvailable = (options?: { identifier?: string }) => {
  const identifier = options?.identifier || "9788702441000";

  cy.intercept("GET", "**/v1/loanstatus/**", {
    statusCode: 200,
    body: publizonLoanStatusFactory.build({
      loanStatus: ContentLoanStatusEnum.NUMBER_4, // Available
      identifier
    })
  }).as("publizonLoanStatusAvailable");
};

/**
 * Given: E-book is unavailable
 * Sets up intercepts to simulate an e-book that cannot be loaned
 */
export const givenEbookIsUnavailable = (options?: { identifier?: string }) => {
  const identifier = options?.identifier || "9788702441000";

  cy.intercept("GET", "**/v1/loanstatus/**", {
    statusCode: 200,
    body: publizonLoanStatusFactory.build({
      loanStatus: ContentLoanStatusEnum.NUMBER_3, // Unavailable
      identifier
    })
  }).as("publizonLoanStatusUnavailable");
};
