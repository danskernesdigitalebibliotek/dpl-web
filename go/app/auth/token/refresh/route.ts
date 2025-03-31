import { headers } from "next/headers"
import { NextRequest, NextResponse } from "next/server"
import * as client from "openid-client"
import { z } from "zod"

import { getEnv } from "@/lib/config/env"
import { getUniloginClientConfig } from "@/lib/session/oauth/uniloginClient"
import { getSession, setUniloginTokensOnSession } from "@/lib/session/session"
import { TUniloginTokenSet } from "@/lib/types/session"

const sessionTokenSchema = z.object({
  isLoggedIn: z.boolean(),
  access_token: z.string(),
  refresh_token: z.string(),
})

// TODO: check if headers still work as intended,
// when reenabling this together with refresh token functionality in the middleware.
export async function GET(request: NextRequest) {
  const requestHeaders = await headers()

  const appUrl = getEnv("APP_URL")
  const config = await getUniloginClientConfig()
  // TODO: Fix refresh token flow with new openid-client.

  const session = await getSession()
  const frontpage = `${appUrl}/`

  // If the user is not logged in, we redirect to the frontpage.
  if (!session.isLoggedIn || !config) {
    return NextResponse.redirect(frontpage, { headers: requestHeaders })
  }

  const redirect = request.nextUrl.searchParams.get("redirect")
  // We need the redirect URL to be present in the query string.
  if (!redirect) {
    return NextResponse.redirect(frontpage, { headers: requestHeaders })
  }

  try {
    // TODO: Consider if we want to handle different types of sessions than unilogin.
    const tokens = sessionTokenSchema.parse(session)
    const newTokens = (await client.refreshTokenGrant(
      config,
      tokens.refresh_token
    )) as unknown as TUniloginTokenSet
    await setUniloginTokensOnSession(session, newTokens)
    await session.save()
  } catch (error) {
    // TODO: maybe distinguish between ZodError and other errors?
    // TODO: Should we redirect to an end-of-session page?
    // Session is corrupt so we need to destroy it.
    session.destroy()

    const isZodError = error instanceof z.ZodError
    console.error(isZodError ? JSON.stringify(error.errors) : error)
  } finally {
    return NextResponse.redirect(redirect, { headers: requestHeaders })
  }
}

export const dynamic = "force-dynamic"
