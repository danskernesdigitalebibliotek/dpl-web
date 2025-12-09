import { connection } from "next/server"

import { destroySessionAndRedirectToFrontPage, getSession } from "@/lib/session/session"

import { handleAdgangsplatformenLogout, handleUniloginLogout } from "./helpers"

export async function GET() {
  await connection() // Opt into dynamic rendering
  const session = await getSession()

  if (session.type === "unilogin") {
    return handleUniloginLogout(session)
  }

  if (session.type === "adgangsplatformen") {
    return handleAdgangsplatformenLogout(session)
  }

  return destroySessionAndRedirectToFrontPage(session)
}
