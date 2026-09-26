import { Factory } from "fishery";
import {
  ReservationListResult,
  ProductResult,
  LoanStatusResult,
  LoanListResult,
  LibraryProfile,
  ApiResponseCode,
  ContentLoanStatusEnum
} from "../../../src/core/publizon/model";

/**
 * Factory for Publizon user data (reservations and loans)
 * Uses generated types from Orval
 */
export const publizonUserFactory = Factory.define<ReservationListResult>(
  () => ({
    reservations: [],
    code: ApiResponseCode.NUMBER_101,
    message: "OK (#101)."
  })
);

/**
 * Factory for Publizon product details
 * Uses generated types from Orval
 */
export const publizonProductFactory = Factory.define<ProductResult>(() => ({
  product: {
    title: "De syv søstre",
    isActive: true,
    languageCode: "dan",
    productType: 1, // 1 = Ebook
    format: "epub",
    costFree: false,
    createdUtc: "2025-06-16T10:41:31.12Z",
    updatedUtc: "2025-08-28T10:51:02.56Z",
    coverUri: null,
    thumbnailUri: null,
    sampleUri: null,
    externalProductId: {
      idType: 15,
      id: "9788702441000"
    },
    internalProductId: "b63d0c64-eb43-4dee-8d9d-d545169abc35",
    contributors: [],
    fileSizeInBytes: 568,
    durationInSeconds: null,
    publisher: "Gyldendal",
    publicationDate: "2025-06-30T00:00:00Z",
    description: "Mock book description",
    productCategories: []
  },
  code: ApiResponseCode.NUMBER_101,
  message: "OK (#101)."
}));

export const publizonLoanStatusFactory = Factory.define<LoanStatusResult>(
  () => ({
    loanStatus: ContentLoanStatusEnum.NUMBER_4,
    onChecklist: false,
    identifier: "9788702441000",
    code: ApiResponseCode.NUMBER_101,
    message: "OK (#101)."
  })
);

/**
 * Factory for Publizon loan list result (user's loaned e-materials)
 * Uses generated types from Orval
 * This is for the /v1/user/loans endpoint which returns an array of loans
 */
export const publizonLoanListFactory = Factory.define<LoanListResult>(() => ({
  loans: [],
  libraryData: {
    loanDurationDays: 30,
    maxAmountPerMonth: 10,
    maxConcurrentEbookLoansPerBorrower: 5,
    maxConcurrentAudiobookLoansPerBorrower: 5
  },
  userData: {
    totalLoans: 0,
    totalEbookLoans: 0,
    totalAudioLoans: 0,
    ebookLoansRemaining: 5,
    audiobookLoansRemaining: 5,
    friendlyCardNumber: "1234567890",
    ebookLoanAvailableUtc: new Date().toISOString(),
    audioLoanAvailableUtc: new Date().toISOString()
  },
  code: ApiResponseCode.NUMBER_101,
  message: "OK (#101)."
}));

/**
 * Factory for Publizon library profile
 * Uses generated types from Orval
 */
export const publizonLibraryProfileFactory = Factory.define<LibraryProfile>(
  () => ({
    maxConcurrentEbookLoansPerBorrower: 5,
    maxConcurrentAudioLoansPerBorrower: 5,
    ebookLoanDurationInDays: 30,
    audioLoanDurationInDays: 30
  })
);
