import { Issuer } from "openid-client"

import goConfig from "@/lib/config/config"

export const getOpenIdClientUniloginClientConfig = async () => {
  const appUrl = goConfig("app.url")
  const apiUrl = await goConfig("service.unilogin.api.url")

  return {
    wellKnownUrl: await goConfig("service.unilogin.wellknown.url"),
    url: apiUrl,
    audience: apiUrl,
    client_id: await goConfig("service.unilogin.client-id"),
    client_secret: await goConfig("service.unilogin.client-secret"),
    scope: "openid",
    redirect_uri: `${appUrl}/auth/callback/unilogin`,
    post_logout_redirect_uri: appUrl,
    response_type: "code",
    grant_type: "authorization_code",
    post_login_route: appUrl ? `${appUrl}/user/profile` : null,
  }
}

export async function getUniloginClient() {
  const config = await getOpenIdClientUniloginClientConfig()
  if (
    !config ||
    !config.client_id ||
    !config.client_secret ||
    !config.redirect_uri ||
    !config.wellKnownUrl
  ) {
    throw new Error("Unilogin client config is invalid.")
  }

  const { wellKnownUrl, client_id, client_secret, redirect_uri } = config
  const UniloginIssuer = await Issuer.discover(wellKnownUrl!)
  const client = new UniloginIssuer.Client({
    client_id,
    client_secret,
    response_types: ["code"],
    redirect_uris: [redirect_uri],
    token_endpoint_auth_method: "client_secret_post",
  })
  return client
}
