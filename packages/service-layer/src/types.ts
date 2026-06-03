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
  preferredPickupBranchId: string
  emailAddress: string | undefined
  phoneNumber: string | undefined
}

export type MaterialAvailability = {
  totalCopies: number
  reservationCount: number
}
