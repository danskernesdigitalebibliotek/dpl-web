import { connection } from "next/server"
import * as client from "openid-client"

import { getEnv } from "@/lib/config/env"
import { getUniloginClientConfig } from "@/lib/session/oauth/uniloginClient"
import { getSession } from "@/lib/session/session"

export async function GET() {
  await connection() // Opt into dynamic rendering
  const session = await getSession()
  const config = await getUniloginClientConfig()
  const appUrl = getEnv("APP_URL")

  if (session.isLoggedIn) {
    return Response.redirect(`${appUrl}/user/profile`)
  }

  if (!config) {
    return Response.redirect(String(appUrl))
  }

  const redirect_uri = `${appUrl}/auth/callback/unilogin`
  const code_verifier = client.randomPKCECodeVerifier()
  const code_challenge = await client.calculatePKCECodeChallenge(code_verifier)
  const code_challenge_method = "S256"

  session.code_verifier = code_verifier
  await session.save()

  const redirectTo = client.buildAuthorizationUrl(config, {
    redirect_uri,
    scope: "openid",
    code_challenge,
    code_challenge_method,
    prompt: "login",
  })

  console.info("unilogin authorization flow started", session)
  return Response.redirect(redirectTo)
}
