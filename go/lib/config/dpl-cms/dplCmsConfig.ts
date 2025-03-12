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

  // If all env vars are present, return them directly without fetching config
  if (wellknownUrl && clientId && clientSecret) {
    return {
      wellknownUrl,
      clientId,
      clientSecret,
      apiData: null,
    }
  }

  // Only fetch config if we're missing some env vars
  const config = await queryDplCmsConfig()

  return {
    wellknownUrl: config?.unilogin?.unilogin_api_wellknown_url ?? null,
    clientId: config?.unilogin?.unilogin_api_client_id ?? null,
    clientSecret: config?.unilogin?.unilogin_api_client_secret ?? null,
    apiData: config?.unilogin ?? null,
  }
}
