import { IronSession } from "iron-session"

import { TSessionData, getDplCmsSessionCookie } from "../session/session"

export const userIsAnonymous = (session: IronSession<TSessionData> | TSessionData | null) =>
  !session || !session.isLoggedIn || session.type === "anonymous"

// Note: this only proves the browser HAS a Drupal session cookie — not that
// the session behind it is still valid. Drupal may have destroyed the session
// server-side (logout, expired token) while the cookie lingers in the
// browser. Whether the user is actually logged in is settled by what the CMS
// answers when the cookie is used (e.g. loadUserToken()).
export const hasDplCmsSessionCookie = async () => {
  const dplCmsSessionCookie = await getDplCmsSessionCookie()
  return Boolean(dplCmsSessionCookie)
}
