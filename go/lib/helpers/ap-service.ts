import { getDplCmsPublicConfig } from "../config/dpl-cms/dplCmsConfig"
import { getEnv } from "../config/env"
import goConfig from "../config/goConfig"

const serviceSettings = goConfig("services.ap-services")
export type TServiceType = keyof typeof serviceSettings

export const getApServiceSettings = (serviceType: TServiceType) => {
  return serviceSettings[serviceType as TServiceType] ?? null
}

export const getApServiceUrl = async (serviceType: TServiceType) => {
  const serviceSettings = getApServiceSettings(serviceType)
  if (!serviceSettings) {
    throw new Error(`No url found for the ${serviceType} service`)
  }

  return serviceSettings.url
}

export const getAPServiceFetcherBaseUrl = (serviceType: TServiceType) =>
  `${getEnv("APP_URL")}/${goConfig("routes.adgangsplatformen-service-proxy")}/${serviceType}`
