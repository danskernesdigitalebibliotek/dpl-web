import { cookies } from "next/headers"
import * as client from "openid-client"

import { getUniloginClientConfig } from "@/lib/session/oauth/uniloginClient"
import { getSession } from "@/lib/session/session"

import {
  destroySessionAndRedirectToFrontPage,
  handleUniloginLogout,
  redirectToFrontPage,
} from "./helpers"

export async function GET() {
  const session = await getSession()

  // If the session is of type anonymous or for some reason is unset,
  // we don't need to do anything because the user is not logged in.
  if (!session.type || session.type === "anonymous") {
    return redirectToFrontPage()
  }

  if (session.type === "unilogin") {
    return handleUniloginLogout(session)
  }

  return destroySessionAndRedirectToFrontPage(session)
}

export const dynamic = "force-dynamic"
