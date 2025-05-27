import { destroySessionAndRedirectToFrontPage, getSession } from "@/lib/session/session"

import { handleAdgangsplatformenLogout, handleUniloginLogout } from "./helpers"

export async function GET() {
  const session = await getSession()

  if (session.type === "unilogin") {
    return handleUniloginLogout(session)
  }

  if (session.type === "adgangsplatformen") {
    return handleAdgangsplatformenLogout(session)
  }

  return destroySessionAndRedirectToFrontPage(session)
}
