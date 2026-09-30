import { IronSession } from "iron-session"
import { NextResponse } from "next/server"
import * as client from "openid-client"

import {
  getUniloginClientConfig,
  getUniloginLogoutEndpoint,
} from "@/lib/session/oauth/uniloginClient"
import {
  TSessionData,
  destroySession,
  destroySessionAndRedirectToFrontPage,
  redirectToFrontPageAndReloadSession,
} from "@/lib/session/session"

import loadAdgangsplatformenLogoutUrl from "./loadAdgangsplatformenLogoutUrl"

export const handleUniloginLogout = async (session: IronSession<TSessionData>) => {
  await logoutUniloginSSO(session)
  return destroySessionAndRedirectToFrontPage(session)
}

// Revoke an access token at the adapter so it cannot be used after logout.
export const revokeUniloginTokens = async (accessToken: string) => {
  const config = await getUniloginClientConfig()
  if (!config) {
    console.error("No client config found for Unilogin.")
    return
  }
  try {
    await client.tokenRevocation(config, accessToken)
  } catch (error) {
    console.error("Could not revoke Unilogin access token.", error)
  }
}

export const logoutUniloginSSO = async (session: IronSession<TSessionData>) => {
  const accessToken = session.access_token
  if (!accessToken) {
    console.error("Could not end session in Unilogin. No access token found.")
    return
  }

  await revokeUniloginTokens(accessToken)

  // Best effort ending of the adapter SSO session. The SSO cookie lives in the
  // browser and cannot be cleared by a server side request; the login route
  // sends force_login=1, so a lingering SSO session never logs anyone in
  // silently.
  try {
    const logoutUrl = new URL(getUniloginLogoutEndpoint())
    logoutUrl.searchParams.set("access_token", accessToken)
    await fetch(logoutUrl)
  } catch (error) {
    console.error("Could not end SSO session in Unilogin.", error)
  }
}

export const handleAdgangsplatformenLogout = async (session: IronSession<TSessionData>) => {
  await destroySession(session)

  // Redirect to the logout url if available.
  const logoutUrl = await loadAdgangsplatformenLogoutUrl()
  if (logoutUrl) {
    return NextResponse.redirect(logoutUrl)
  } else {
    console.error("Could not resolve Adgangsplatformen logout url.")
    return redirectToFrontPageAndReloadSession()
  }
}
