import { IronSession } from "iron-session"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import * as client from "openid-client"

import goConfig from "@/lib/config/goConfig"
import { getUniloginClientConfig } from "@/lib/session/oauth/uniloginClient"
import { TSessionData } from "@/lib/session/session"

export const destroySessionAndRedirectToFrontPage = async (session: IronSession<TSessionData>) => {
  const appUrl = new URL(String(goConfig("app.url")))

  session.destroy()
  return NextResponse.redirect(`${appUrl.toString()}?reload-session=true`)
}

export const redirectToFrontPage = async () => {
  const appUrl = new URL(String(goConfig("app.url")))
  return NextResponse.redirect(appUrl)
}

export const handleUniloginLogout = async (session: IronSession<TSessionData>) => {
  const config = await getUniloginClientConfig()

  // If we don't have a client config, we can't do anything.
  if (!config) {
    return redirectToFrontPage()
  }

  // Call the Unilogin end session endpoint.
  const id_token = (await cookies()).get("go-session:id_token")?.value

  // TODO: Is this where we want to redirect to if id token cannot be resolved?
  if (!id_token) {
    // Without an id token, we can't logout in the SSO.
    // So we destroy the session and redirect to the frontpage.
    return destroySessionAndRedirectToFrontPage(session)
  }
  // Resolve the end session SSO endpoint.
  const endSessionEndpoint = config.serverMetadata().end_session_endpoint
  if (!endSessionEndpoint) {
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
