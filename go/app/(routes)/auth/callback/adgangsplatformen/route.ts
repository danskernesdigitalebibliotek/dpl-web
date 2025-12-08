import { NextResponse, connection } from "next/server"

import { getEnv } from "@/lib/config/env"
import goConfig from "@/lib/config/goConfig"
import { loadUserToken } from "@/lib/helpers/user-token"
import { getSession, saveAdgangsplatformenSession } from "@/lib/session/session"

export async function GET() {
  await connection() // Opt into dynamic rendering
  const userTokenData = await loadUserToken()

  if (userTokenData) {
    const session = await getSession()
    await saveAdgangsplatformenSession(session, userTokenData)
    return NextResponse.redirect(`${getEnv("APP_URL")}/user/profile`)
  }

  // We could not retrieve the user token.
  // So we redirect to the login failed page  without setting the session.
  console.error("Could not retrieve Adgangsplatformen user token.")
  return NextResponse.redirect(`${getEnv("APP_URL")}/${goConfig("routes.login-failed-ap")}`)
}
