import { NextResponse, connection } from "next/server"

import { getBaseURL } from "@/lib/config/getBaseURL"
import goConfig from "@/lib/config/goConfig"
import { getAndClearLoginRedirectUrl } from "@/lib/helpers/login-redirect"
import { loadUserToken } from "@/lib/helpers/user-token"
import { getSession, saveAdgangsplatformenSession } from "@/lib/session/session"

export async function GET() {
  await connection() // Opt into dynamic rendering
  const userTokenData = await loadUserToken()

  if (userTokenData) {
    const session = await getSession()
    await saveAdgangsplatformenSession(session, userTokenData)
    const loginRedirectUrl = await getAndClearLoginRedirectUrl()
    if (loginRedirectUrl) {
      return NextResponse.redirect(`${getBaseURL()}${loginRedirectUrl}`)
    }
    return NextResponse.redirect(`${getBaseURL()}/user/profile`)
  }

  // We could not retrieve the user token.
  // So we redirect to the login failed page  without setting the session.
  console.error("Could not retrieve Adgangsplatformen user token.")
  return NextResponse.redirect(`${getBaseURL()}/${goConfig("routes.login-failed-ap")}`)
}
