import { NextResponse } from "next/server"

import goConfig from "@/lib/config/goConfig"
import { getSession, saveAdgangsplatformenSession } from "@/lib/session/session"

import loadUserToken from "./loadUserToken"

export async function GET() {
  const userTokenData = await loadUserToken()

  if (userTokenData) {
    const session = await getSession()
    await saveAdgangsplatformenSession(session, userTokenData)
    return NextResponse.redirect(`${goConfig("app.url")}/user/profile`)
  }

  // We could not retrieve the user token.
  // So we redirect to the frontpage without setting the session.
  console.error("Could not retrieve Adgangsplatformen user token.")
  return NextResponse.redirect(`${goConfig("app.url")}/${goConfig("routes.login-failed")}`)
}

export const dynamic = "force-dynamic"
