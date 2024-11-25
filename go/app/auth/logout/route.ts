import { cookies } from "next/headers"
import * as client from "openid-client"

import goConfig from "@/lib/config/goConfig"
import { getUniloginClientConfig } from "@/lib/session/oauth/uniloginClient"
import { getSession } from "@/lib/session/session"

export async function GET() {
  const session = await getSession()
  const config = await getUniloginClientConfig()
  const appUrl = new URL(String(goConfig("app.url")))

  session.destroy()

  // TODO: Distinguish between session types here.
  const id_token = cookies().get("go-session:id_token")?.value
  // TODO: Is this where we want to redirect to if id token cannot be resolved?
  if (!id_token) {
    return Response.redirect(appUrl)
  }
  const endSessionEndpoint = config.serverMetadata().end_session_endpoint

  if (!endSessionEndpoint) {
    return Response.redirect(appUrl)
  }

  const endSessionUrl = client.buildEndSessionUrl(config, {
    id_token_hint: id_token,
  })

  // End session in Unilogin SSO.
  await fetch(endSessionUrl)

  return Response.redirect(`${appUrl.toString()}?reload-session=true`)
}
