// ============================================================================
// FBS Service Layer Types
// ============================================================================
// These are the service layer's own types — not re-exports of generated types.
// Only fields actually consumed by the apps are included.
// ============================================================================

// ----------------------------------------------------------------------------
// Config
// ----------------------------------------------------------------------------

export type FbsFetcherConfig = {
  baseUrl: string
  getAuthHeader: () => Promise<string | null> | string | null
}

// ----------------------------------------------------------------------------
// Shared types
// ----------------------------------------------------------------------------

export type Periodical = {
  displayText: string
  volume?: string
  volumeNumber?: string
  volumeYear?: string
}

export type MaterialGroup = {
  description?: string
  name: string
}

// ----------------------------------------------------------------------------
// Patron domain
// ----------------------------------------------------------------------------

export type AuthenticationStatus = "VALID" | "INVALID" | "LOANER_LOCKED_OUT"

export type AuthenticatedPatronInfo = {
  status: AuthenticationStatus
  patron?: PatronInfo
}

export type Address = {
  city: string
  coName: string
  country: string
  postalCode: string
  street: string
}

export type PatronInfo = {
  name?: string
  patronId: number
  address?: Address
  blockStatus?: BlockStatus[]
  emailAddress?: string
  phoneNumber?: string
  notificationProtocols?: string[]
  onHold?: Period
  preferredLanguage?: string
  preferredPickupBranch: string
  receiveEmail: boolean
  receivePostalMail: boolean
  receiveSms: boolean
  resident: boolean
  guardianVisibility: boolean
}

export type BlockStatus = {
  blockedReason: string
  blockedSince: string
  message: string
}

export type Period = {
  from?: string
  to?: string
}

export type PatronSettings = {
  emailAddresses?: EmailAddress[]
  phoneNumbers?: PhoneNumber[]
  preferredPickupBranch: string
  receivePostalMail: boolean
  onHold?: Period
  preferredLanguage?: string
  notificationProtocols?: string[]
  guardianVisibility: boolean
  interests?: string[]
}

export type EmailAddress = {
  emailAddress: string
  receiveNotification: boolean
}

export type PhoneNumber = {
  phoneNumber: string
  receiveNotification: boolean
}

export type PincodeChange = {
  libraryCardNumber: string
  pincode: string
}

export type UpdatePatronRequest = {
  patron?: PatronSettings
  pincodeChange?: PincodeChange
}

export type CreatePatronRequest = {
  personIdentifier: string
  pincode: string
  patron: PatronSettings
  blockStatusRequest?: BlockStatusRequest
}

export type BlockStatusRequest = {
  blockedReason: string
  blockedSince?: string
}

// ----------------------------------------------------------------------------
// Fee domain
// ----------------------------------------------------------------------------

export type Fee = {
  amount: number
  creationDate: string
  feeId: number
  materials: FeeMaterial[]
  payableByClient: boolean
  reasonMessage: string
}

export type FeeMaterial = {
  materialItemNumber: string
  recordId: string
}

// ----------------------------------------------------------------------------
// Loan domain
// ----------------------------------------------------------------------------

export type Loan = {
  isRenewable: boolean
  loanDetails: LoanDetails
  renewalStatusList: string[]
}

export type LoanDetails = {
  dueDate: string
  ilBibliographicRecord?: BibliographicRecord
  loanDate: string
  loanId: number
  loanType: string
  materialItemNumber: string
  periodical?: Periodical
  recordId: string
}

export type RenewedLoan = {
  loanDetails: LoanDetails
  renewalStatus: string[]
}

export type BibliographicRecord = {
  author?: string
  language?: string
  publicationDate?: string
  title?: string
}

// ----------------------------------------------------------------------------
// Reservation domain
// ----------------------------------------------------------------------------

export type ReservationDetails = {
  dateOfReservation: string
  expiryDate: string
  ilBibliographicRecord?: BibliographicRecord
  numberInQueue?: number
  periodical?: Periodical
  pickupBranch: string
  pickupDeadline?: string
  pickupNumber?: string
  recordId: string
  reservationId: number
  reservationType: string
  state: string
  transactionId: string
}

export type ReservationResponse = {
  reservationResults: ReservationResult[]
  success: boolean
}

export type ReservationResult = {
  reservationDetails?: ReservationDetails
  result: string
}

export type CreateReservation = {
  expiryDate?: string
  periodical?: PeriodicalReservation
  pickupBranch?: string
  recordId: string
}

export type CreateReservationBatch = {
  reservations: CreateReservation[]
  type?: string
}

export type UpdateReservation = {
  expiryDate?: string
  pickupBranch?: string
  reservationId: number
}

export type UpdateReservationBatch = {
  reservations: UpdateReservation[]
}

export type DeleteReservationsParams = {
  reservationid: number[]
}

export type PeriodicalReservation = {
  volume?: string
  volumeNumber?: string
  volumeYear?: string
}

// ----------------------------------------------------------------------------
// Branch domain
// ----------------------------------------------------------------------------

export type Branch = {
  branchId: string
  title: string
}

export type GetBranchesParams = {
  exclude?: string[]
}

// ----------------------------------------------------------------------------
// Availability domain
// ----------------------------------------------------------------------------

export type Availability = {
  available: boolean
  recordId: string
  reservable: boolean
  reservations: number
}

export type GetAvailabilityParams = {
  recordid: string[]
  exclude?: string[]
}

// ----------------------------------------------------------------------------
// Holdings domain
// ----------------------------------------------------------------------------

export type HoldingsForBibliographicalRecord = {
  holdings: HoldingsLogistics[]
  recordId: string
  reservable: boolean
  reservations: number
}

export type HoldingsLogistics = {
  branch: Branch
  lmsPlacement?: Placement
  logisticsPlacement?: string[]
  materials: HoldingsMaterial[]
}

export type HoldingsMaterial = {
  available: boolean
  itemNumber: string
  materialGroup: MaterialGroup
  periodical?: Periodical
}

export type Placement = {
  department?: { departmentId: string; title: string }
  location?: { locationId: string; title: string }
  sublocation?: { sublocationId: string; title: string }
}

// ----------------------------------------------------------------------------
// Params
// ----------------------------------------------------------------------------

export type GetFeesParams = {
  includepaid: boolean
  includenonpayable: boolean
}

export type GetHoldingsParams = {
  recordid: string[]
  exclude?: string[]
}
