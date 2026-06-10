import { getDplCmsSessionCookie } from "../session/cms-session-cookie"
import type { TSession, TSessionData } from "../session/types"

export const userIsAnonymous = (session: TSession | TSessionData | null) =>
  !session || !session.isLoggedIn || session.type === "anonymous"

export const userIsLoggedInAtDplCms = async () => {
  const dplCmsSessionCookie = await getDplCmsSessionCookie()
  return Boolean(dplCmsSessionCookie)
}
