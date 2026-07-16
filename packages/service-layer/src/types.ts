// Backends this package knows how to talk to. Apps never name these in
// hook calls — only in the resolvers they implement on ServiceLayerConfig.
export type ApiId = "fbs"

export type ServiceLayerConfig = {
  getBaseUrl: (api: ApiId) => string
  getAuthHeader: (api: ApiId) => Promise<string> | string
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

export type Loan = {
  loanId: number
  recordId: string
  dueDate: string
  loanDate: string
  materialItemNumber: string
  isRenewable: boolean
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
