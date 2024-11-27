import { QueryClient } from "@tanstack/react-query"

import {
  GetDplCmsConfigurationQuery,
  useGetDplCmsConfigurationQuery,
} from "@/lib/graphql/generated/dpl-cms/graphql"

const queryDplCmsConfig = async (queryClient: QueryClient) => {
  const config = await queryClient.fetchQuery<GetDplCmsConfigurationQuery>({
    queryKey: useGetDplCmsConfigurationQuery.getKey(),
    queryFn: useGetDplCmsConfigurationQuery.fetcher(),
    // Cache 5 minutes unless invalidated
    staleTime: 60 * 5,
  })

  // TODO: Should we handle errors here?
  // What if we cannot load remote config?
  return config.dplConfiguration ?? null
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
