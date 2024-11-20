import { cookies } from "next/headers"
import { generators } from "openid-client"

import goConfig from "@/lib/config/config"
import { getUniloginClient, uniloginClientConfig } from "@/lib/session/oauth/uniloginClient"
import { getSession } from "@/lib/session/session"

export async function GET() {
  const session = await getSession()
  // TODO: Distinguish between session types here.
  const id_token = (await cookies()).get("go-session:id_token")?.value
  // TODO: Is this where we want to redirect to if id token cannot be resolved?
  if (!id_token) {
    return Response.redirect(goConfig("app.url"))
  }
  const client = await getUniloginClient()
  const endSession = client.endSessionUrl({
    post_logout_redirect_uri: uniloginClientConfig.post_logout_redirect_uri,
    id_token_hint: id_token,
    state: generators.state(),
  })

  session.destroy()
  return Response.redirect(endSession)
}
