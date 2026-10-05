import { IronSession } from "iron-session"
import { NextResponse } from "next/server"

import {
  TSessionData,
  destroySession,
  redirectToFrontPageAndReloadSession,
} from "@/lib/session/session"

import loadAdgangsplatformenLogoutUrl from "./loadAdgangsplatformenLogoutUrl"

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
