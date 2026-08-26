// Backends this package knows how to talk to. Apps never name these in
// hook calls — only in the resolvers they implement on ServiceLayerConfig.
export type ApiId = "fbs" | "biblio"

export type ServiceLayerConfig = {
  getBaseUrl: (api: ApiId) => string
  getAuthHeader: (api: ApiId) => Promise<string> | string
  // Whether the session may call patron-scoped endpoints (patron, loans,
  // reservations, fees). The patron hooks disable themselves when false, so
  // call sites can't forget to guard — sessions without patron access (in GO:
  // Unilogin and anonymous) never fire doomed 401 requests. Public data
  // (material availability) ignores it. Defaults to true when omitted.
  isPatronAuthenticated?: boolean
}

export type Patron = {
  name: string | undefined
  isLocked: boolean
  pickupBranchId: string
  emailAddress: string | undefined
  phoneNumber: string | undefined
}

export type MaterialAvailability = {
  totalCopies: number
  reservationCount: number
}

export type CreateReservationInput = {
  recordId: string
  pickupBranchId?: string
  expiryDate?: string
}

export type CreateReservationSuccess = {
  status: "success"
  recordId: string
  reservationId: number
  pickupBranchId: string
  numberInQueue: number | undefined
}

// FBS-documented failure codes. Unknown values from the API are coerced to "unknown"
// so callers can render a generic fallback while staying inside the union.
export const RESERVATION_FAILURE_REASONS = [
  "patron_is_blocked",
  "patron_not_found",
  "already_reserved",
  "already_loaned",
  "material_not_loanable",
  "material_not_reservable",
  "material_lost",
  "material_discarded",
  "loaning_profile_not_found",
  "material_not_found",
  "material_part_of_collection",
  "not_reservable",
  "no_reservable_materials",
  "interlibrary_material_not_reservable",
  "previously_loaned_by_homebound_patron",
  "exceeds_max_reservations",
  "unknown",
] as const

export type FailureReason = (typeof RESERVATION_FAILURE_REASONS)[number]

export type CreateReservationFailed = {
  status: "failed"
  recordId: string
  reason: FailureReason
}

export type CreateReservationResult = CreateReservationSuccess | CreateReservationFailed

export type Reservation = {
  reservationId: number
  recordId: string
  pickupBranchId: string
  numberInQueue: number | undefined
  state: string
  // Set once the reservation is ready for pickup.
  pickupDeadline: string | undefined
  pickupNumber: string | undefined
}

export type Fee = {
  feeId: number
  // In the currency of the agency.
  amount: number
  creationDate: string
  dueDate: string | undefined
  // Free text from FBS, in the language of the agency.
  reasonMessage: string
  // "fee" | "compensation" — unrecognized values must be treated as "other".
  type: string
  payableByClient: boolean
  // How many materials the fee covers; 0 when the materials no longer exist
  // (e.g. fees from closed interlibrary loans).
  materialCount: number
}

export type Loan = {
  loanId: number
  recordId: string
  dueDate: string
  loanDate: string
  materialItemNumber: string
  isRenewable: boolean
  // Set when isRenewable is false: the first documented denial code from
  // FBS' renewalStatusList (e.g. deniedReserved when another patron waits).
  nonRenewableReason: RenewalFailureReason | undefined
}

// FBS-documented renewal denial codes. The spec instructs that unrecognized
// values must be treated as "deniedOtherReason", so callers can render a
// generic fallback while staying inside the union.
export const RENEWAL_FAILURE_REASONS = [
  "deniedReserved",
  "deniedMaxRenewalsReached",
  "deniedLoanerIsBlocked",
  "deniedMaterialIsNotLoanable",
  "deniedMaterialIsNotFound",
  "deniedLoanerNotFound",
  "deniedLoaningProfileNotFound",
  "deniedOtherReason",
] as const

export type RenewalFailureReason = (typeof RENEWAL_FAILURE_REASONS)[number]

export type RenewedLoanSuccess = {
  loanId: number
  recordId: string
  dueDate: string
  renewed: true
}

export type RenewedLoanFailed = {
  loanId: number
  recordId: string
  dueDate: string
  renewed: false
  reason: RenewalFailureReason
}

export type RenewedLoan = RenewedLoanSuccess | RenewedLoanFailed

// The types below describe what an app reasons about — a digital loan, a
// reservation, a lending decision — not which service happened to answer.
// Biblio (WeDoBooks) is the only source today, but a second one would arrive
// as another mapper onto these same types rather than as a parallel set of
// service-prefixed ones. What is service-specific is the client that fetches
// (`createBiblioClient`) and the functions that name which backend to ask
// (`getDigitalLoans`), not the shape they hand back.
//
// "Digital" is the meaningful distinction, not the vendor: these are the
// materials a patron reads or listens to in a reader, as opposed to the
// physical ones FBS lends out.

// Formats a digital material comes in. Loans and reservations may also report
// `paper_book` — see MaterialType.
export type DigitalMaterialType = "ebook" | "audiobook"

// The broad material type used by the loan and reservation DTOs. Metadata
// only ever describes digital materials, so it uses the narrower
// DigitalMaterialType.
export type MaterialType = DigitalMaterialType | "paper_book"

// Catalogue fields for a digital material.
export type DigitalMaterial = {
  isbn: string
  materialType: DigitalMaterialType
  title: string
  description: string
  publishDate: string
  languages: string[]
  // The only catalogue field the contract does not require.
  authors: string[]
}

export type DigitalLoan = {
  loanId: string
  materialId: string
  materialType: MaterialType
  startDate: string
  endDate: string
  active: boolean
  // A loan carries its own catalogue fields, so presenting it needs no
  // metadata lookup. `author` is one string here, a list on DigitalMaterial.
  title: string
  author: string
  publisher: string
  publishDate: string
  // Which licence the loan was made under. "selection" marks a blue title:
  // a loan that costs the user nothing and draws on no quota.
  loanProvider: LoanProvider
}

export type DigitalReservation = {
  reservationId: string
  materialId: string
  materialType: MaterialType
  createdDate: string
  // Date where the reservation is expected to be converted to a loan at the
  // latest.
  expectedLoanDate: string
  // Set when the reservation has been offered to the user and can be
  // accepted (redeemed) as a loan.
  offerId?: string
  offerExpiresAt?: string
}

export type LoanDecisionStatus =
  | "loanable"
  | "reservable"
  | "wishable"
  | "unavailable"
  | "monthly_limit_exceeded"
  | "concurrent_limit_exceeded"
  | "no_valid_credentials"
  | "lending_blocked"

// Which licence the loan would be made under. The organization configures a
// prioritized list of providers, and the backend reports the one it picked.
// "selection" - the licence Danish blue titles answer with - is the one
// verified to cost the user nothing; the rest, including the unobserved
// "free", count against the quota until DBC confirms otherwise.
export type LoanProvider = "free" | "k-fond" | "click" | "package" | "premium" | "selection"

// Whether a loan can be made right now, and if not, why. The answer covers
// both the material (is it out on loan?) and the patron (quota, lending
// blocks), so callers pick the part they care about - see
// isMaterialAvailable.
//
// The same decision comes back from two places: asking up front whether a
// loan is possible, and asking for the loan itself - the adapter answers a
// refused request with a decision rather than an HTTP error. Hence one type
// for the decision, and LoanRequestResult for a decision that also produced
// a loan.
export type LoanDecision = {
  status: LoanDecisionStatus
  loanProvider?: LoanProvider
  unavailableReason?: string
  lendingBlockReason?: string
}

// The outcome of asking for a loan or a reservation: the decision, plus the
// loan when the request actually produced one.
export type LoanRequestResult = LoanDecision & {
  loan: DigitalLoan | undefined
}

// Loan quotas for the user per organization. Organizations either count
// e-books and audiobooks together (combined) or separately (split on format).
export type DigitalLoanQuota =
  | {
      splitOnFormat: false
      orgId: string
      orgName: string
      maxLoans: number
      maxConcurrentLoans: number
      currentConcurrentLoans: number
      currentMonthlyLoans: number
    }
  | {
      splitOnFormat: true
      orgId: string
      orgName: string
      maxLoans: { ebook: number; audiobook: number }
      maxConcurrentLoans: { ebook: number; audiobook: number }
      currentConcurrentLoans: { ebook: number; audiobook: number }
      currentMonthlyLoans: { ebook: number; audiobook: number }
    }

// Short-lived token that signs the patron in to the reader and player.
export type ReaderSignInToken = {
  token: string
  expiresInSeconds: number
}
