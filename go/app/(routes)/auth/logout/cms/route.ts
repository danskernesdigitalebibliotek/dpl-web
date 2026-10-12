import { NextResponse, connection } from "next/server"

import { getEnv } from "@/lib/config/env"
import { destroySession, getSession } from "@/lib/session/session"

// The CMS routes its own logout flow through this endpoint.
// The GO session cookie lives on the GO host, so the CMS cannot clear it
// itself — without this hop a GO session created from the (now dead) Drupal
// session would keep reporting the user as logged in.
export async function GET() {
  await connection() // Opt into dynamic rendering
  const session = await getSession()

  // Adgangsplatformen and Unilogin sessions are both tied to the CMS session.
  await destroySession(session)

  // Send the user back to where the CMS logout would otherwise have landed.
  return NextResponse.redirect(getEnv("DPL_CMS_BASE_URL"))
}
