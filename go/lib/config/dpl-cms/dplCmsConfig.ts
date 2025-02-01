import { QueryClient } from "@tanstack/react-query"

import getQueryClient from "@/lib/getQueryClient"
import {
  GetDplCmsConfigurationQuery,
  useGetDplCmsConfigurationQuery,
} from "@/lib/graphql/generated/dpl-cms/graphql"

const queryDplCmsConfig = async (queryClient: QueryClient) => {
  const { dplConfiguration } = await queryClient.fetchQuery<GetDplCmsConfigurationQuery>({
    queryKey: useGetDplCmsConfigurationQuery.getKey(),
    queryFn: useGetDplCmsConfigurationQuery.fetcher(),
    // TODO: Set this when caching strategy is implemented.
    // Choosing half a minute for now.
    staleTime: 30000,
  })

  return dplConfiguration ?? null
}

export const ensureDplCmsConfig = async (queryClient: QueryClient) => {
  await queryClient.ensureQueryData({
    queryKey: useGetDplCmsConfigurationQuery.getKey(),
    queryFn: useGetDplCmsConfigurationQuery.fetcher(),
    // TODO: Set this when caching strategy is implemented.
    // Choosing a minute for now.
    staleTime: 60000,
  })
}

export const getDplCmsUniloginConfig = async () => {
  const queryClient = getQueryClient()
  const config = await queryDplCmsConfig(queryClient)

  return {
    wellknownUrl: process.env.UNILOGIN_WELLKNOWN_URL
      ? process.env.UNILOGIN_WELLKNOWN_URL
      : (config?.unilogin?.unilogin_api_wellknown_url ?? null),
    clientId: process.env.UNILOGIN_CLIENT_ID
      ? process.env.UNILOGIN_CLIENT_ID
      : (config?.unilogin?.unilogin_api_client_id ?? null),
    clientSecret: process.env.UNILOGIN_CLIENT_SECRET
      ? process.env.UNILOGIN_CLIENT_SECRET
      : (config?.unilogin?.unilogin_api_client_secret ?? null),
    apiData: config?.unilogin ?? null,
  }
}
