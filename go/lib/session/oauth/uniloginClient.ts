import { Issuer } from "openid-client"

import goConfig from "@/lib/config/config"

const appUrl = goConfig("app.url") as string
const uniloginApiUrl = goConfig("service.unilogin.api.url") as string
const uniloginWellKnownUrl = goConfig("service.unilogin.wellknown.url") as string
const clientId = goConfig("service.unilogin.client-id") as string
const clientSecret = goConfig("service.unilogin.client-secret") as string

export const uniloginClientConfig = {
  wellKnownUrl: uniloginWellKnownUrl,
  url: uniloginApiUrl,
  audience: process.env.UNILOGIN_API_URL,
  client_id: clientId,
  client_secret: clientSecret,
  scope: "openid",
  redirect_uri: `${appUrl}/auth/callback/unilogin`,
  post_logout_redirect_uri: `${appUrl}`,
  response_type: "code",
  grant_type: "authorization_code",
  post_login_route: `${appUrl}/user/profile`,
}

export async function getUniloginClient() {
  const UniloginIssuer = await Issuer.discover(uniloginClientConfig.wellKnownUrl)
  const client = new UniloginIssuer.Client({
    client_id: uniloginClientConfig.client_id!,
    client_secret: uniloginClientConfig.client_secret!,
    response_types: ["code"],
    redirect_uris: [uniloginClientConfig.redirect_uri],
    token_endpoint_auth_method: "client_secret_post",
  })
  return client
}
