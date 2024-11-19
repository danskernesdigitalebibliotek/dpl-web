import { generators } from "openid-client"

import { getUniloginClient } from "@/lib/session/oauth/uniloginClient"
import { getSession } from "@/lib/session/session"

export const revalidate = 1

export async function GET() {
  const configResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/auth/config`)
  if (!configResponse.ok) {
    throw new Error("Failed to fetch config")
  }
  const config = await configResponse.json()
  const uniloginConfig = config?.dplConfiguration?.unilogin

  const session = await getSession()
  session.code_verifier = generators.codeVerifier()

  const client = await getUniloginClient({
    client_id: uniloginConfig.unilogin_api_client_id,
    client_secret: uniloginConfig.unilogin_api_client_secret,
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback/unilogin`,
    wellKnownUrl: uniloginConfig.unilogin_api_wellknown_url,
  })

  const code_challenge = generators.codeChallenge(session.code_verifier)
  const url = client.authorizationUrl({
    scope: "openid",
    audience: process.env.UNILOGIN_API_URL,
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback/unilogin`,
    code_challenge,
    code_challenge_method: "S256",
  })

  await session.save()

  return Response.redirect(url)
}
