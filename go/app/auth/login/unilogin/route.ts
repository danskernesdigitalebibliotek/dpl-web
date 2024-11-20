import { generators } from "openid-client"

import {
  getOpenIdClientUniloginClientConfig,
  getUniloginClient,
} from "@/lib/session/oauth/uniloginClient"
import { getSession } from "@/lib/session/session"

export async function GET() {
  const session = await getSession()

  session.code_verifier = generators.codeVerifier()

  const code_challenge = generators.codeChallenge(session.code_verifier)

  const openIdClientConfig = await getOpenIdClientUniloginClientConfig()

  if (
    !openIdClientConfig ||
    !openIdClientConfig.scope ||
    !openIdClientConfig.redirect_uri ||
    !openIdClientConfig.audience
  ) {
    throw new Error("Unilogin client config is invalid.")
  }

  const client = await getUniloginClient()

  const url = client.authorizationUrl({
    scope: openIdClientConfig.scope,
    audience: openIdClientConfig.audience,
    redirect_uri: openIdClientConfig.redirect_uri,
    code_challenge,
    code_challenge_method: "S256",
  })

  await session.save()
  return Response.redirect(url)
}
