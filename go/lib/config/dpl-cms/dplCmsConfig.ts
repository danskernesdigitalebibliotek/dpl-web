"use server"

import { cacheTag } from "next/cache"
import { connection } from "next/server"

import {
  useGetDplCmsPrivateConfigurationQuery,
  useGetDplCmsPublicConfigurationQuery,
} from "@/lib/graphql/generated/dpl-cms/graphql"

import { getEnv, getServerEnv } from "../env"
import { privateConfigSchema, publicConfigSchema } from "./configSchemas"

// Cache tags for the two configuration documents. The CMS revalidates them
// through /cache/revalidate, and the e2e suite uses the same route to drop a
// config that was cached before its mocks were up.
// Not exported: "use server" modules may only export async functions.
const DPL_CMS_PUBLIC_CONFIG_TAG = "dpl-cms-public-config"
const DPL_CMS_PRIVATE_CONFIG_TAG = "dpl-cms-private-config"

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
  cacheTag(DPL_CMS_PRIVATE_CONFIG_TAG)

  try {
    const data = await queryDplCmsPrivateConfig()
    return privateConfigSchema.parse(data)
  } catch {
    return {
      unilogin: {
        clientSecret: null,
        pubHubRetailerKeyCode: null,
      },
    }
  }
}

/**
 * TODO: only use env variables for unilogin configuration, and remove the unilogin configuration from DPL CMS.
 * This will simplify the configuration and make it more secure, as we won't be storing sensitive information in DPL CMS.
 **/
export const getDplCmsPrivateConfig = async () => {
  await connection()
  const data = await getDplCmsPrivateConfigData()

  const uniLoginConfigEnv = {
    ...(getServerEnv("UNILOGIN_CLIENT_SECRET")
      ? { clientSecret: getServerEnv("UNILOGIN_CLIENT_SECRET") }
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

// What the app runs on when the CMS cannot be read. Adgangsplatformen login
// is disabled without its url, so this is a degraded state.
const publicConfigFallback = () => ({
  loginUrls: {
    adgangsplatformen: null,
  },
  logoutUrls: {
    adgangsplatformen: null,
  },
  libraryInfo: {
    name: null,
    baseURL: null,
  },
  mapp: null,
  unilogin: {
    municipalityId: null,
  },
  blacklistedAvailabilityBranches: [],
  smsNotificationsEnabled: true,
})

// Throws rather than returning the fallback, so a failed read is not what
// gets cached: the caller substitutes the fallback outside the cache scope
// and the next request asks the CMS again.
const getDplCmsPublicConfigData = async () => {
  "use cache"
  cacheTag(DPL_CMS_PUBLIC_CONFIG_TAG)

  const data = await queryDplCmsPublicConfig()
  return publicConfigSchema.parse(data)
}

export const getDplCmsPublicConfig = async () => {
  await connection()
  const data = await getDplCmsPublicConfigData().catch(() => {
    console.error("Failed to parse DPL CMS public config")
    return publicConfigFallback()
  })

  // Copied rather than assigned into: `data` can be the cached object, and
  // writing to it would edit what every later caller reads.
  const envMunicipalityId = getServerEnv("UNILOGIN_MUNICIPALITY_ID")
  return {
    ...data,
    unilogin: {
      ...data.unilogin,
      ...(envMunicipalityId ? { municipalityId: envMunicipalityId } : {}),
    },
    libraryInfo: {
      ...data.libraryInfo,
      baseURL: getEnv("DPL_CMS_BASE_URL"),
    },
  }
}
