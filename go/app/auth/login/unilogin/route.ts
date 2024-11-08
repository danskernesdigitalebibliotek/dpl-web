import { generators } from "openid-client"

import { getUniloginClient, uniloginClientConfig } from "@/lib/session/oauth/uniloginClient"
import { getSession } from "@/lib/session/session"

export async function GET() {
  const session = await getSession()

  session.code_verifier = generators.codeVerifier()

  const code_challenge = generators.codeChallenge(session.code_verifier)

  const client = await getUniloginClient()
  const url = client.authorizationUrl({
    scope: uniloginClientConfig.scope,
    audience: uniloginClientConfig.audience,
    redirect_uri: uniloginClientConfig.redirect_uri,
    code_challenge,
    code_challenge_method: "S256",
  })

  await session.save()
  return Response.redirect(url)
}
