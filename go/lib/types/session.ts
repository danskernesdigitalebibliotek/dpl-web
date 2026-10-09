export type TSessionType = "adgangsplatformen" | "unilogin" | "anonymous"

export type TApiType = "dpl-cms"

// A user token handed out by the CMS. Its type decides the session type.
export type TUserToken = {
  token: string
  expire: {
    timestamp: number
  }
  type: Exclude<TSessionType, "anonymous">
}
