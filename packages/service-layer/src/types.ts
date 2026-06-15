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

// Failed branch is intentionally minimal — error mapping arrives in a later slice.
export type CreateReservationFailed = {
  status: "failed"
  recordId: string
  reason: string
}

export type CreateReservationResult = CreateReservationSuccess | CreateReservationFailed
