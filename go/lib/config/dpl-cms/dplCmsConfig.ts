"use server"

import { cacheTag } from "next/cache"
import { connection } from "next/server"

import {
  useGetDplCmsPrivateConfigurationQuery,
  useGetDplCmsPublicConfigurationQuery,
} from "@/lib/graphql/generated/dpl-cms/graphql"

import { getEnv, getServerEnv } from "../env"
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
  // Tagged so /cache/revalidate?tags=dpl-cms-config can drop the entry —
  // used by the e2e tests when a spec changes the mocked configuration, and
  // available to Drupal-triggered revalidation. Default cache time is 15
  // minutes otherwise.
  cacheTag("dpl-cms-config")

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
  biblio: {
    enabled: false,
    baseUrl: null,
    sdk: null,
  },
  smsNotificationsEnabled: true,
})

// Throws when the CMS cannot be read, so only a successful read is cached.
// The caller supplies the fallback outside the cache scope.
const getDplCmsPublicConfigData = async () => {
  "use cache"
  // See getDplCmsPrivateConfigData for the tag.
  cacheTag("dpl-cms-config")

  const data = await queryDplCmsPublicConfig()
  return publicConfigSchema.parse(data)
}

export const getDplCmsPublicConfig = async () => {
  await connection()
  const data = await getDplCmsPublicConfigData().catch(() => {
    console.error("Failed to parse DPL CMS public config")
    return publicConfigFallback()
  })

  // `data` is the cached object in the normal path, so the env overrides go
  // into a copy that every caller gets its own of.
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
