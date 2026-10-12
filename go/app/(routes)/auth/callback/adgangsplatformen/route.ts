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

    // Only a Unilogin session can fail to be created: a patron session is
    // always saved. GO reads the student's uni-id and institutions from the
    // Adgangsplatformen userinfo endpoint (loadUniloginUserInfo()), and gets
    // here when that fails - the endpoint refuses the token or does not answer,
    // the request throws, or the response lacks a uni-id or has institution
    // ids in an unexpected shape. The student is logged in to the CMS, but has
    // no GO session; the middleware tries again on later requests while the
    // Drupal session lives.
    console.error("Could not create a Unilogin session from the user token.")
    return NextResponse.redirect(`${getBaseURL()}/${goConfig("routes.login-failed-unilogin")}`)
  }

  // We could not retrieve the user token.
  // So we redirect to the login failed page  without setting the session.
  console.error("Could not retrieve Adgangsplatformen user token.")
  return NextResponse.redirect(`${getBaseURL()}/${goConfig("routes.login-failed-ap")}`)
}
