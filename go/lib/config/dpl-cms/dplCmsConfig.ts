import { unstable_cacheLife as cacheLife } from "next/cache"
import { z } from "zod"

import {
  useGetDplCmsPrivateConfigurationQuery,
  useGetDplCmsPublicConfigurationQuery,
} from "@/lib/graphql/generated/dpl-cms/graphql"

import { getServerEnv } from "../env"

const queryDplCmsPrivateConfig = async () => {
  const { goConfiguration } = await useGetDplCmsPrivateConfigurationQuery.fetcher(undefined)()
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
  const config = await queryDplCmsPrivateConfig()
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
    libraryInfo: z.object({
      name: z.string().nullable(),
    }),
  }),
})

export type TDplCmsPublicConfig = z.infer<typeof dplCmsPublicConfigSchema>["public"]

export const getDplCmsPublicConfig = async () => {
  "use cache"
  // Automatically expires after a few minutes
  cacheLife("minutes")

  // @todo Implement cache tags when we are sure that the cms is revalidating go configuration properly.
  try {
    const data = await useGetDplCmsPublicConfigurationQuery.fetcher(undefined)()
    return dplCmsPublicConfigSchema.parse(data.goConfiguration).public
  } catch {
    return {
      loginUrls: {
        adgangsplatformen: null,
      },
      logoutUrls: {
        adgangsplatformen: null,
      },
      libraryInfo: {
        name: null,
      },
    }
  }
}
