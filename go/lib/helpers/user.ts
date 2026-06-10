import { TSessionData } from "@/lib/session/definitions"

// import { getDplCmsSessionCookie } from "@/lib/session/serverSideSession"

export const userIsAnonymous = (session: TSessionData | null) =>
  !session || !session.isLoggedIn || session.type === "anonymous"

export const userIsLoggedInAtDplCms = async () => {
  // const dplCmsSessionCookie = await getDplCmsSessionCookie()
  return false
}
