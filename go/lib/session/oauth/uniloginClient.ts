import * as client from "openid-client"

import goConfig from "@/lib/config/config"

const appUrl = goConfig("app.url")

export const uniloginClientSettings = {
  post_login_route: `${appUrl}/user/profile`,
}

export async function getUniloginClientConfig() {
  const server: URL = new URL(goConfig("service.unilogin.wellknown.url"))
  const clientId: string = goConfig("service.unilogin.client-id")
  const clientSecret: string = goConfig("service.unilogin.client-secret")
  return await client.discovery(server, clientId, clientSecret)
}
