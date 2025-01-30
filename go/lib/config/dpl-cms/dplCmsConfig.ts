import { QueryClient } from "@tanstack/react-query"

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
    initialData: {},
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

// eslint-disable-next-line prefer-const
let dplCmsConfigClient = new QueryClient({})

export const getDplCmsUniloginConfig = async () => {
  const config = await queryDplCmsConfig(dplCmsConfigClient)

  return {
    wellknownUrl: process.env.UNILOGIN_WELLKNOWN_URL
      ? process.env.UNILOGIN_WELLKNOWN_URL
      : (config?.unilogin?.unilogin_api_wellknown_url ?? null),
    clientId: process.env.UNILOGIN_CLIENT_ID
      ? process.env.UNILOGIN_CLIENT_ID
      : (config?.unilogin?.unilogin_api_client_id ?? null),
    clientSecret: process.env.UNILOGIN_CLIENT_SECRET
      ? process.env.UNILOGIN_WELLKNOWN_URL
      : (config?.unilogin?.unilogin_api_client_secret ?? null),
    apiData: config?.unilogin ?? null,
  }
}
