import * as client from "openid-client"

import { getDplCmsUniloginConfig } from "@/lib/config/dpl-cms/dplCmsConfig"
import { getEnv } from "@/lib/config/env"

export const uniloginClientSettings = {
  post_login_route: `${getEnv("APP_URL")}/user/profile`,
}

export async function getUniloginClientConfig() {
  const { wellknownUrl, clientId, clientSecret } = await getDplCmsUniloginConfig()

  let isMissingConfiguration = false
  // We need all of these to be able to continue.
  // TODO: Consider if we should throw an error instead of just logging.
  // Then we would be able to use the error boundary to catch it.
  if (!wellknownUrl) {
    console.error("Missing wellknownUrl for Unilogin client")
    isMissingConfiguration = true
  }
  if (!clientId) {
    console.error("Missing clientId for Unilogin client")
    isMissingConfiguration = true
  }
  if (!clientSecret) {
    console.error("Missing clientSecret for Unilogin client")
    isMissingConfiguration = true
  }

  if (isMissingConfiguration) {
    return null
  }

  return await client.discovery(
    new URL(String(wellknownUrl)),
    clientId as string,
    clientSecret as string
  )
}
