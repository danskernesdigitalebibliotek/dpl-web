import { NextResponse, connection } from "next/server"

import { getBaseURL } from "@/lib/config/getBaseURL"
import goConfig from "@/lib/config/goConfig"
import { getAndClearLoginRedirectUrl } from "@/lib/helpers/login-redirect"
import { loadUserToken } from "@/lib/helpers/user-token"
import { getSession, saveSessionFromUserToken } from "@/lib/session/session"

// Both Adgangsplatformen and Unilogin logins run through the CMS and land
// here. The type of the user token decides which kind of session we create.
export async function GET() {
  await connection() // Opt into dynamic rendering
  const userTokenData = await loadUserToken()

  if (userTokenData.status === "token") {
    const session = await getSession()
    if (await saveSessionFromUserToken(session, userTokenData.data)) {
      const loginRedirectUrl = await getAndClearLoginRedirectUrl()
      if (loginRedirectUrl) {
        return NextResponse.redirect(`${getBaseURL()}${loginRedirectUrl}`)
      }
      return NextResponse.redirect(`${getBaseURL()}/user/profile`)
    }

    if (userTokenData.data.type === "unilogin") {
      console.error("Could not create a Unilogin session from the user token.")
      return NextResponse.redirect(`${getBaseURL()}/${goConfig("routes.login-failed-unilogin")}`)
    }
  }

  // We could not retrieve the user token.
  // So we redirect to the login failed page  without setting the session.
  console.error("Could not retrieve Adgangsplatformen user token.")
  return NextResponse.redirect(`${getBaseURL()}/${goConfig("routes.login-failed-ap")}`)
}
