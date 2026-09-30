import { connection } from "next/server"

import { destroySessionAndRedirectToFrontPage, getSession } from "@/lib/session/session"

import { handleAdgangsplatformenLogout } from "./helpers"

export async function GET() {
  await connection() // Opt into dynamic rendering
  const session = await getSession()

  // Both session types live on the Drupal session, so both log out through
  // the CMS, which also ends the single sign-on session at Adgangsplatformen.
  if (session.type === "adgangsplatformen" || session.type === "unilogin") {
    return handleAdgangsplatformenLogout(session)
  }

  return destroySessionAndRedirectToFrontPage(session)
}
