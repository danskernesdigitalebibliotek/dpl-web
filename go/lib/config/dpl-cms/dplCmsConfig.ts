"use server"

import { connection } from "next/server"

import {
  useGetDplCmsPrivateConfigurationQuery,
  useGetDplCmsPublicConfigurationQuery,
} from "@/lib/graphql/generated/dpl-cms/graphql"

import { getServerEnv } from "../env"
import { privateConfigSchema, publicConfigSchema } from "./configSchemas"

const queryDplCmsPrivateConfig = async () => {
  const { goConfiguration } = await useGetDplCmsPrivateConfigurationQuery.fetcher(undefined)()
  return goConfiguration?.private ?? null
}

const queryDplCmsPublicConfig = async () => {
  const { goConfiguration } = await useGetDplCmsPublicConfigurationQuery.fetcher(undefined)()
  return goConfiguration?.public ?? null
}

const getDplCmsPrivateConfigData = async () => {
  "use cache"
  // @todo: We should handle triggered revalidation or having a longer caching time.
  // Right now the default cache time should be 15 minutes.

  try {
    const data = await queryDplCmsPrivateConfig()
    return privateConfigSchema.parse(data)
  } catch {
    return {
      unilogin: {
        clientSecret: null,
        webServiceUsername: null,
        webServicePassword: null,
        pubHubRetailerKeyCode: null,
      },
    }
  }
}

export const getDplCmsPrivateConfig = async () => {
  await connection()
  const data = await getDplCmsPrivateConfigData()

  const uniLoginConfigEnv = {
    ...(getServerEnv("UNILOGIN_CLIENT_SECRET")
      ? { clientSecret: getServerEnv("UNILOGIN_CLIENT_SECRET") }
      : {}),
    ...(getServerEnv("UNLILOGIN_SERVICES_WS_USER")
      ? { webServiceUsername: getServerEnv("UNLILOGIN_SERVICES_WS_USER") }
      : {}),
    ...(getServerEnv("UNLILOGIN_SERVICES_WS_PASSWORD")
      ? { webServicePassword: getServerEnv("UNLILOGIN_SERVICES_WS_PASSWORD") }
      : {}),
    ...(getServerEnv("UNLILOGIN_PUBHUB_RETAILER_KEY_CODE")
      ? { pubHubRetailerKeyCode: getServerEnv("UNLILOGIN_PUBHUB_RETAILER_KEY_CODE") }
      : {}),
  }

  const unilogin = {
    ...data.unilogin,
    ...uniLoginConfigEnv,
  }
  return {
    ...data,
    unilogin,
  }
}

const getDplCmsPublicConfigData = async () => {
  "use cache"
  // @todo: We should handle triggered revalidation or having a longer caching time.
  // Right now the default cache time should be 15 minutes.

  try {
    const data = await queryDplCmsPublicConfig()
    return publicConfigSchema.parse(data)
  } catch {
    console.error("Failed to parse DPL CMS public config")
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
      unilogin: {
        municipalityId: null,
      },
    }
  }
}

export const getDplCmsPublicConfig = async () => {
  await connection()
  const data = await getDplCmsPublicConfigData()
  // If environment variables are set, they will override the values from DPL CMS.
  const envMunicipalityId = getServerEnv("UNILOGIN_MUNICIPALITY_ID")
  if (envMunicipalityId) {
    data.unilogin.municipalityId = envMunicipalityId
  }

  return data
}
