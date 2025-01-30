import { QueryClient } from "@tanstack/react-query"

import {
  GetDplCmsConfigurationQuery,
  useGetDplCmsConfigurationQuery,
} from "@/lib/graphql/generated/dpl-cms/graphql"

const queryDplCmsConfig = async (queryClient: QueryClient) => {
  const { dplConfiguration } = await queryClient.fetchQuery<GetDplCmsConfigurationQuery>({
    queryKey: useGetDplCmsConfigurationQuery.getKey(),
    queryFn: useGetDplCmsConfigurationQuery.fetcher(),
    // Cache 5 minutes unless invalidated
    staleTime: 5 * 60 * 1000, // 5 mins
    initialData: {},
  })

  return dplConfiguration ?? null
}

// eslint-disable-next-line prefer-const
let dplCmsConfigClient = new QueryClient({})

const getDplCmsConfig = async () => {
  const result = await queryDplCmsConfig(dplCmsConfigClient)

  return result
}

export const getDplCmsUniloginConfig = async () => {
  const config = await getDplCmsConfig()

  return config?.unilogin ?? null
}
