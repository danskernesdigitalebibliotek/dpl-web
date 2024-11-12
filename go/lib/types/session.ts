import { TokenSet } from "openid-client"

export type TSessionType = "adgangsplatformen" | "unilogin" | "anonymous"

export type TApiType = "dpl-cms"

export type TTokenSet = TokenSet & { id_token: string; refresh_expires_in: number }
