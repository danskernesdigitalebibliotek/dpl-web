import { useGetDplCmsConfigurationQuery } from "@/lib/graphql/generated/dpl-cms/graphql"

import { getServerEnv } from "../env"

const queryDplCmsConfig = async () => {
  const { goConfiguration } = await useGetDplCmsConfigurationQuery.fetcher(undefined, {
    next: { revalidate: 30 },
  })()

  return goConfiguration ?? null
}

export const getDplCmsUniloginConfig = async () => {
  const wellknownUrl = getServerEnv("UNILOGIN_WELLKNOWN_URL")
  const clientId = getServerEnv("UNILOGIN_CLIENT_ID")
  const clientSecret = getServerEnv("UNILOGIN_CLIENT_SECRET")

  const configEnv = {
    wellknownUrl,
    clientId,
    clientSecret,
  }

  let configAPI = {}
  try {
    const config = await queryDplCmsConfig()
    if (config?.unilogin) {
      configAPI = {
        wellknownUrl: config.unilogin.unilogin_api_wellknown_url ?? null,
        clientId: config.unilogin.unilogin_api_client_id ?? null,
        clientSecret: config.unilogin.unilogin_api_client_secret ?? null,
        apiData: config.unilogin.unilogin_api_url ?? null,
      }
    }
  } catch {
    // catch silently
  }

  return {
    ...configAPI,
    ...configEnv,
  }
}
