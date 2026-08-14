// Backends this package knows how to talk to. Apps never name these in
// hook calls — only in the resolvers they implement on ServiceLayerConfig.
export type ApiId = "fbs"

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

export type BiblioMaterial = {
  isbn: string
  materialType: "ebook" | "audiobook"
}

// The broad material type used by the loan and reservation DTOs. The metadata
// endpoints use the narrower BiblioMaterial["materialType"].
export type BiblioMaterialType = "ebook" | "audiobook" | "paper_book"

export type BiblioLoan = {
  loanId: string
  materialId: string
  materialType: BiblioMaterialType
  startDate: string
  endDate: string
  active: boolean
}

export type BiblioReservation = {
  reservationId: string
  materialId: string
  materialType: BiblioMaterialType
  createdDate: string
  // Date where the reservation is expected to be converted to a loan at the
  // latest.
  expectedLoanDate: string
  // Set when the reservation has been offered to the user and can be
  // accepted (redeemed) as a loan.
  offerId?: string
  offerExpiresAt?: string
}

export type BiblioCanLoanStatus =
  | "loanable"
  | "reservable"
  | "wishable"
  | "unavailable"
  | "monthly_limit_exceeded"
  | "concurrent_limit_exceeded"
  | "no_valid_credentials"
  | "lending_blocked"

export type BiblioCanLoan = {
  status: BiblioCanLoanStatus
  unavailableReason?: string
  lendingBlockReason?: string
}

// Result of creating a loan or a reservation. The loan is only set when the
// operation resulted in an actual loan.
export type BiblioLoanResult = BiblioCanLoan & {
  loan: BiblioLoan | undefined
}

// Loan quotas for the user per organization. Organizations either count
// e-books and audiobooks together (combined) or separately (split on format).
export type BiblioLoanQuota =
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

export type BiblioSignInToken = {
  token: string
  expiresInSeconds: number
}
