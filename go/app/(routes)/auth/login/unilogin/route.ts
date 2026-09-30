import { connection } from "next/server"
import * as client from "openid-client"

import { getServerEnv } from "@/lib/config/env"
import { getBaseURL } from "@/lib/config/getBaseURL"
import { getUniloginClientConfig } from "@/lib/session/oauth/uniloginClient"
import { getSession } from "@/lib/session/session"

export async function GET() {
  await connection() // Opt into dynamic rendering
  const session = await getSession()
  const config = await getUniloginClientConfig()
  const appUrl = getBaseURL()

  if (session.isLoggedIn) {
    return Response.redirect(`${appUrl}/user/profile`)
  }

  if (!config) {
    return Response.redirect(String(appUrl))
  }

  const redirect_uri = `${appUrl}/auth/callback/unilogin`
  // The adapter does not support PKCE, so a state parameter guards the callback.
  const state = client.randomState()
  const agencyId = getServerEnv("UNILOGIN_AGENCY_ID")

  session.state = state
  await session.save()

  const redirectTo = client.buildAuthorizationUrl(config, {
    redirect_uri,
    state,
    // Skip the identity provider picker and go straight to Unilogin.
    idp: "unilogin_oidc",
    ...(agencyId ? { agency: agencyId } : {}),
    // Always show the login form instead of silently reusing the SSO session.
    force_login: "1",
  })

  console.info("unilogin authorization flow started", session)
  return Response.redirect(redirectTo)
}
