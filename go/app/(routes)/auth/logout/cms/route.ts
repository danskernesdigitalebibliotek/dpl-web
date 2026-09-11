import { NextResponse, connection } from "next/server"

import { getEnv } from "@/lib/config/env"
import { destroySession, getSession } from "@/lib/session/session"

// The CMS routes its own Adgangsplatformen logout flow through this endpoint.
// The GO session cookie lives on the GO host, so the CMS cannot clear it
// itself — without this hop a GO session created from the (now dead) Drupal
// session would keep reporting the user as logged in.
export async function GET() {
  await connection() // Opt into dynamic rendering
  const session = await getSession()

  // Only Adgangsplatformen sessions are tied to the CMS session. Unilogin
  // sessions live independently of the CMS and must survive a CMS logout.
  if (session.type === "adgangsplatformen") {
    await destroySession(session)
  }

  // Send the user back to where the CMS logout would otherwise have landed.
  return NextResponse.redirect(getEnv("DPL_CMS_BASE_URL"))
}
