import { getEnv } from "../config/env"
import goConfig from "../config/goConfig"
import { getLibraryTokenCookieValue } from "./library-token"

const serviceSettings = goConfig("services.ap-services")
export type TServiceType = keyof typeof serviceSettings

export const getApServiceSettings = (serviceType: TServiceType) => {
  return serviceSettings[serviceType as TServiceType] ?? null
}

export const getApServiceUrl = (serviceType: TServiceType) => {
  const serviceSettings = getApServiceSettings(serviceType)
  if (!serviceSettings) {
    throw new Error(`No url found for the ${serviceType} service`)
  }

  return serviceSettings.url
}

export const getAPServiceFetcherBaseUrl = (serviceType: TServiceType) => {
  const serviceSettings = getApServiceSettings(serviceType)
  const serviceUrl = getApServiceUrl(serviceType)

  // If we always use the library token,
  // there is no need to use the Adangsplatformen service proxy.
  // And we can use the service url directly.
  if (serviceSettings?.useLibraryTokenAlways) {
    return serviceUrl
  }

  return `${getEnv("APP_URL")}/${goConfig("routes.adgangsplatformen-service-proxy")}/fbi`
}

export const getAPServiceFetcherAuthheader = async (serviceType: TServiceType) => {
  const serviceSettings = getApServiceSettings(serviceType)

  if (serviceSettings?.useLibraryTokenAlways) {
    const libraryToken = await getLibraryTokenCookieValue()
    return libraryToken ? `Bearer ${libraryToken}` : null
  }

  return null
}
