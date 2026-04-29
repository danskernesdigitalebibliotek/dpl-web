export type FbsFetcherConfig = {
  baseUrl: string
  getAuthHeader: () => Promise<string | null> | string | null
}

export type PatronInfo = {
  name: string | undefined
  patronId: number
}

export type AuthenticationStatus = "VALID" | "INVALID" | "LOANER_LOCKED_OUT"

export type AuthenticatedPatronInfo = {
  status: AuthenticationStatus
  patron: PatronInfo | undefined
}
