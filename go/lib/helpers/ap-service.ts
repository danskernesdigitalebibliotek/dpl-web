import goConfig from "../config/goConfig"

const serviceSettings = goConfig("services.url-and-library-token-settings")
export type TServiceType = keyof typeof serviceSettings

export const getApServiceSettings = (serviceType: TServiceType) => {
  return serviceSettings[serviceType as TServiceType] ?? null
}
