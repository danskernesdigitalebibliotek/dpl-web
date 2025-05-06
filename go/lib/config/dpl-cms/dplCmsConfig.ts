import { z } from "zod"

import getQueryClient from "@/lib/getQueryClient"
import {
  GetDplCmsPublicConfigurationQuery,
  useGetDplCmsPrivateConfigurationQuery,
  useGetDplCmsPublicConfigurationQuery,
} from "@/lib/graphql/generated/dpl-cms/graphql"

import { getEnv, getServerEnv } from "../env"

const queryDplCmsPrivateConfig = async () => {
  const { goConfiguration } = await useGetDplCmsPrivateConfigurationQuery.fetcher(undefined, {
    next: { revalidate: 30 },
  })()

  return goConfiguration?.private ?? null
}

export const getDplCmsPrivateUniloginConfig = async () => {
  const wellknownUrl = getServerEnv("UNILOGIN_WELLKNOWN_URL")
  const clientId = getServerEnv("UNILOGIN_CLIENT_ID")
  const clientSecret = getServerEnv("UNILOGIN_CLIENT_SECRET")

  const configEnv = {
    wellknownUrl,
    clientId,
    clientSecret,
  }

  let configAPI = {}
  // If we are running in test mode, we don't want to query the DPL CMS config
  const config = getEnv("TEST_MODE") ? null : await queryDplCmsPrivateConfig()
  if (config?.unilogin) {
    configAPI = {
      wellknownUrl: config.unilogin.unilogin_api_wellknown_url ?? null,
      clientId: config.unilogin.unilogin_api_client_id ?? null,
      clientSecret: config.unilogin.unilogin_api_client_secret ?? null,
    }
  }

  return {
    ...configAPI,
    ...configEnv,
  }
}

const dplCmsPublicConfigSchema = z.object({
  public: z.object({
    loginUrls: z.object({
      adgangsplatformen: z.string().nullable(),
    }),
    logoutUrls: z.object({
      adgangsplatformen: z.string().nullable(),
    }),
  }),
})

export type TDplCmsPublicConfig = z.infer<typeof dplCmsPublicConfigSchema>["public"]

export const getDplCmsPublicConfig = async () => {
  const queryClient = getQueryClient()
  try {
    const config = await queryClient.fetchQuery<GetDplCmsPublicConfigurationQuery>({
      queryKey: useGetDplCmsPublicConfigurationQuery.getKey(),
      queryFn: useGetDplCmsPublicConfigurationQuery.fetcher(),
      initialData: {},
      staleTime: 0,
    })

    return dplCmsPublicConfigSchema.parse(config.goConfiguration).public
  } catch {
    return {
      loginUrls: {
        adgangsplatformen: null,
      },
      logoutUrls: {
        adgangsplatformen: null,
      },
    }
  }
}
