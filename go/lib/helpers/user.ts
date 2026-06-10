import { TSession, TSessionData, getDplCmsSessionCookie } from "../session/session"

export const userIsAnonymous = (session: TSession | TSessionData | null) =>
  !session || !session.isLoggedIn || session.type === "anonymous"

export const userIsLoggedInAtDplCms = async () => {
  const dplCmsSessionCookie = await getDplCmsSessionCookie()
  return Boolean(dplCmsSessionCookie)
}
