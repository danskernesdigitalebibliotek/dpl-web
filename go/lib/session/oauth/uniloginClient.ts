import * as client from "openid-client"

import { getServerEnv } from "@/lib/config/env"
import { isTest } from "@/lib/config/environmentChecks"

// login.bib.dk does not expose OIDC discovery (/.well-known/openid-configuration),
// so the endpoints are declared manually from the adapter base url.
export const getUniloginAdapterMetadata = (adapterUrl: string): client.ServerMetadata => ({
  issuer: adapterUrl,
  authorization_endpoint: `${adapterUrl}/oauth/authorize`,
  token_endpoint: `${adapterUrl}/oauth/token/`,
  userinfo_endpoint: `${adapterUrl}/userinfo/`,
  revocation_endpoint: `${adapterUrl}/oauth/revoke`,
})

export const getUniloginLogoutEndpoint = () => {
  const adapterUrl = getServerEnv("UNILOGIN_ADAPTER_URL")
  return `${adapterUrl}/logout/`
}

export async function getUniloginClientConfig() {
  const clientId = getServerEnv("ADGANGSPLATFORMEN_CLIENT_ID")
  const clientSecret = getServerEnv("ADGANGSPLATFORMEN_CLIENT_SECRET")
  const adapterUrl = getServerEnv("UNILOGIN_ADAPTER_URL")
  let isMissingConfiguration = false
  // We need all of these to be able to continue.
  // TODO: Consider if we should throw an error instead of just logging.
  // Then we would be able to use the error boundary to catch it.
  if (!adapterUrl) {
    console.error("Missing adapter url for Unilogin client")
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

  const config = new client.Configuration(
    getUniloginAdapterMetadata(String(adapterUrl)),
    clientId as string,
    clientSecret as string
  )

  if (isTest()) {
    // Allow insecure requests while testing
    client.allowInsecureRequests(config)
  }

  return config
}
