import { IronSession } from "iron-session"
import { NextResponse } from "next/server"
import * as client from "openid-client"

import goConfig from "@/lib/config/goConfig"
import { getUniloginClientConfig } from "@/lib/session/oauth/uniloginClient"
import { TSessionData, deleteUniloginIdToken, getUniloginIdToken } from "@/lib/session/session"

import loadAdgangsplatformenLogoutUrl from "./loadAdgangsplatformenLogoutUrl"

export const destroySessionAndRedirectToFrontPage = async (session: IronSession<TSessionData>) => {
  const appUrl = new URL(String(goConfig("app.url")))

  const id_token = await getUniloginIdToken()
  if (id_token) {
    await deleteUniloginIdToken()
  }

  session.destroy()
  return NextResponse.redirect(`${appUrl.toString()}?reload-session=true`)
}

export const redirectToFrontPage = async () => {
  const appUrl = new URL(String(goConfig("app.url")))

  return NextResponse.redirect(appUrl)
}

export const handleUniloginLogout = async (session: IronSession<TSessionData>) => {
  const config = await getUniloginClientConfig()
  const id_token = await getUniloginIdToken()

  // If we don't have a client config, we can't do anything.
  if (!config) {
    console.error("No client config found for Unilogin.")
    return destroySessionAndRedirectToFrontPage(session)
  }

  // Call the Unilogin end session endpoint.
  // TODO: Is this where we want to redirect to if id token cannot be resolved?
  if (!id_token) {
    console.error("Could not end session in Unilogin. No id token found.")
    // Without an id token, we can't logout in the SSO.
    // So we destroy the session and redirect to the frontpage.
    return destroySessionAndRedirectToFrontPage(session)
  }
  // Resolve the end session SSO endpoint.
  const endSessionEndpoint = config.serverMetadata().end_session_endpoint
  if (!endSessionEndpoint) {
    console.error("Could not resolve Unlogin end session endpoint.")
    // We can't do anything without an end session endpoint.
    // So we destroy the session and redirect to the frontpage.
    return destroySessionAndRedirectToFrontPage(session)
  }
  // End session in Unilogin SSO.
  const endSessionUrl = client.buildEndSessionUrl(config, {
    id_token_hint: id_token,
  })
  await fetch(endSessionUrl)

  return destroySessionAndRedirectToFrontPage(session)
}

export const handleAdgangsplatformenLogout = async (session: IronSession<TSessionData>) => {
  // Destroy session and id token.
  session.destroy()
  const id_token = await getUniloginIdToken()
  if (id_token) {
    await deleteUniloginIdToken()
  }

  // Redirect to the logout url if available.
  const logoutUrl = await loadAdgangsplatformenLogoutUrl()
  if (logoutUrl) {
    return NextResponse.redirect(logoutUrl)
  } else {
    console.error("Could not resolve Adgangsplatformen logout url.")
    return destroySessionAndRedirectToFrontPage(session)
  }
}
