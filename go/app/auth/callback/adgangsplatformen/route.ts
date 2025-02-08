import { NextResponse } from "next/server"

import goConfig from "@/lib/config/goConfig"
import {
  getSession,
  saveAdgangsplatformenSession,
  setAdgangsplatformenUserTokenOnSession,
} from "@/lib/session/session"

import loadUserToken from "./loadUserToken"

export async function GET() {
  const userToken = await loadUserToken()

  if (!userToken) {
    // We could not retrieve the user token.
    // So we redirect to the frontpage without setting the session.
    return NextResponse.redirect(goConfig("app.url") ?? "/")
  }

  const session = await getSession()
  saveAdgangsplatformenSession(session, userToken)

  return NextResponse.redirect(`${goConfig("app.url")}/user/profile`)
}

export const dynamic = "force-dynamic"
