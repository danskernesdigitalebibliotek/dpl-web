export type Patron = {
  name: string | undefined
}

export type AuthenticationStatus = "VALID" | "INVALID" | "LOCKED_OUT"

export type AuthenticatedPatron = {
  status: AuthenticationStatus
  patron: Patron | undefined
}
