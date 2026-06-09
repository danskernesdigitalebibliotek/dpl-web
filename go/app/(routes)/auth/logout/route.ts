import { connection } from "next/server"

import {
  destroySessionAndRedirectToFrontPage,
  getSessionDataProvider,
} from "@/lib/session/serverSideSession"

import { handleAdgangsplatformenLogout, handleUniloginLogout } from "./helpers"

export async function GET() {
  await connection() // Opt into dynamic rendering
  const sessionData = await getSessionDataProvider()
  const sessionType = await sessionData.getValue("authenticationMethod")

  if (sessionType === "unilogin") {
    return handleUniloginLogout(sessionData)
  } else if (sessionType === "adgangsplatformen") {
    return handleAdgangsplatformenLogout(sessionData)
  }

  return destroySessionAndRedirectToFrontPage(sessionData)
}
