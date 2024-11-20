import { QueryClient } from "@tanstack/react-query"

import {
  GetDplCmsConfigurationQuery,
  useGetDplCmsConfigurationQuery,
} from "@/lib/graphql/generated/dpl-cms/graphql"

const queryDplCmsConfig = async (queryClient: QueryClient) => {
  const { dplConfiguration } = await queryClient.fetchQuery<GetDplCmsConfigurationQuery>({
    queryKey: useGetDplCmsConfigurationQuery.getKey(),
    queryFn: useGetDplCmsConfigurationQuery.fetcher(),
  })

  return dplConfiguration ?? null
}

// eslint-disable-next-line prefer-const
let dplCmsConfigClient = new QueryClient()

const getDplCmsConfig = async () => {
  const result = await queryDplCmsConfig(dplCmsConfigClient)

  return result
}

const getDplCmsUniloginConfig = async () => {
  const config = await getDplCmsConfig()

  return config?.unilogin ?? null
}

export const withUniloginConfig = async (
  configFunc: (
    config: NonNullable<GetDplCmsConfigurationQuery["dplConfiguration"]>["unilogin"]
  ) => string | undefined
) => {
  const uniloginConfig = await getDplCmsUniloginConfig()

  return configFunc(uniloginConfig)
}
