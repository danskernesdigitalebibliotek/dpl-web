import { Issuer } from "openid-client"

import goConfig from "@/lib/config/config"

const appUrl = goConfig("app.url")

export const uniloginClientConfig = {
  wellKnownUrl: process.env.UNILOGIN_WELKNOWN_URL,
  url: process.env.UNILOGIN_API_URL,
  audience: process.env.UNILOGIN_API_URL,
  client_id: process.env.UNILOGIN_CLIENT_ID,
  client_secret: process.env.UNILOGIN_CLIENT_SECRET,
  scope: "openid",
  redirect_uri: `${appUrl}/auth/callback/unilogin`,
  post_logout_redirect_uri: `${appUrl}`,
  response_type: "code",
  grant_type: "authorization_code",
  post_login_route: `${appUrl}/user/profile`,
}
export async function getUniloginClient() {
  const UniloginIssuer = await Issuer.discover(uniloginClientConfig.wellKnownUrl!)
  const client = new UniloginIssuer.Client({
    client_id: uniloginClientConfig.client_id!,
    client_secret: uniloginClientConfig.client_secret!,
    response_types: ["code"],
    redirect_uris: [uniloginClientConfig.redirect_uri],
    token_endpoint_auth_method: "client_secret_post",
  })
  return client
}
