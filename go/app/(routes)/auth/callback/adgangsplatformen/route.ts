import { NextResponse, connection } from "next/server"

import { getBaseURL } from "@/lib/config/getBaseURL"
import goConfig from "@/lib/config/goConfig"
import { getAndClearLoginRedirectUrl } from "@/lib/helpers/login-redirect"
import { loadUserToken } from "@/lib/helpers/user-token"
import {
  deleteObsoleteCookies,
  getSessionDataProvider,
  saveAdgangsplatformenSession,
} from "@/lib/session/serverSideSession"

export async function GET() {
  await connection() // Opt into dynamic rendering
  void deleteObsoleteCookies()
  const userTokenData = await loadUserToken()

  if (userTokenData) {
    const sessionData = await getSessionDataProvider()

    await saveAdgangsplatformenSession(sessionData, userTokenData)
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
