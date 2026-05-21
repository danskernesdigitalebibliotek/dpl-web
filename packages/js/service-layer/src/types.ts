export type PatronInfo = {
  name: string | undefined
  patronId: number
}

export type AuthenticationStatus = "VALID" | "INVALID" | "LOCKED_OUT"

export type AuthenticatedPatronInfo = {
  status: AuthenticationStatus
  patron: PatronInfo | undefined
}
