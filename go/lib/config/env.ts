/* eslint-disable no-restricted-properties */
import { z } from "zod"

function getEnvs() {
  return {
    // Public env variables
    DPL_CMS_HOSTNAME: process.env.NEXT_PUBLIC_DPL_CMS_HOSTNAME,
    GRAPHQL_SCHEMA_ENDPOINT_DPL_CMS: process.env.NEXT_PUBLIC_GRAPHQL_SCHEMA_ENDPOINT_DPL_CMS,
    GRAPHQL_BASIC_TOKEN_DPL_CMS: process.env.NEXT_PUBLIC_GRAPHQL_BASIC_TOKEN_DPL_CMS,
    GRAPHQL_SCHEMA_ENDPOINT_FBI: process.env.NEXT_PUBLIC_GRAPHQL_SCHEMA_ENDPOINT_FBI,
    LIBRARY_TOKEN: process.env.NEXT_PUBLIC_LIBRARY_TOKEN,
    APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NODE_ENV: process.env.NODE_ENV,
    TEST_MODE: process.env.TEST_MODE,

    // Server-only env variables
    UNILOGIN_API_URL: process.env.UNILOGIN_API_URL,
    UNILOGIN_CLIENT_ID: process.env.UNILOGIN_CLIENT_ID,
    UNILOGIN_CLIENT_SECRET: process.env.UNILOGIN_CLIENT_SECRET,
    UNILOGIN_WELLKNOWN_URL: process.env.UNILOGIN_WELLKNOWN_URL,
    GO_SESSION_SECRET: process.env.GO_SESSION_SECRET,
    UNLILOGIN_PUBHUB_CLIENT_ID: process.env.UNLILOGIN_PUBHUB_CLIENT_ID,
    UNLILOGIN_PUBHUB_RETAILER_ID: process.env.UNLILOGIN_PUBHUB_RETAILER_ID,
    UNLILOGIN_PUBHUB_RETAILER_KEY_CODE: process.env.UNLILOGIN_PUBHUB_RETAILER_KEY_CODE,
    UNLILOGIN_SERVICES_WS_USER: process.env.UNLILOGIN_SERVICES_WS_USER,
    UNLILOGIN_SERVICES_WS_PASSWORD: process.env.UNLILOGIN_SERVICES_WS_PASSWORD,
    UNILOGIN_MUNICIPALITY_ID: process.env.UNILOGIN_MUNICIPALITY_ID,
  }
}

const EnvSchema = z.object({
  DPL_CMS_HOSTNAME: z.string(),
  GRAPHQL_SCHEMA_ENDPOINT_DPL_CMS: z.string().refine(validateUrl),
  GRAPHQL_BASIC_TOKEN_DPL_CMS: z.string(),
  GRAPHQL_SCHEMA_ENDPOINT_FBI: z.string().refine(validateUrl),
  LIBRARY_TOKEN: z.string(),
  APP_URL: z.string().refine(validateUrl),
  NODE_ENV: z.union([z.literal("development"), z.literal("production"), z.literal("test")]),
  TEST_MODE: z.coerce.boolean().default(false),
})

// Environment variables only available in Nodejs.
// Should only be fetched with getServerEnv().
const EnvServerSchema = z.object({
  UNILOGIN_API_URL: z.string().refine(validateUrl),
  GO_SESSION_SECRET: z.string().min(32),
  UNLILOGIN_PUBHUB_CLIENT_ID: z.string(),
  UNLILOGIN_PUBHUB_RETAILER_ID: z.string(),
  UNLILOGIN_PUBHUB_RETAILER_KEY_CODE: z.string(),
  UNLILOGIN_SERVICES_WS_USER: z.string(),
  UNLILOGIN_SERVICES_WS_PASSWORD: z.string(),
  UNILOGIN_MUNICIPALITY_ID: z.string(),
  // Is fetched from dpl-cms, but can be overridden by env vars
  UNILOGIN_CLIENT_ID: z.string().optional(),
  UNILOGIN_CLIENT_SECRET: z.string().optional(),
  UNILOGIN_WELLKNOWN_URL: z.string().refine(validateUrl).optional(),
})

type EnvSchema = z.infer<typeof EnvSchema>
type EnvServerSchema = z.infer<typeof EnvServerSchema>

export function getEnv<T extends keyof EnvSchema>(key: T): z.infer<typeof EnvSchema>[T] {
  return validateEnv(EnvSchema)[key]
}

export function getServerEnv<T extends keyof EnvServerSchema>(
  key: T
): z.infer<typeof EnvServerSchema>[T] {
  return validateEnv(EnvServerSchema)[key]
}

function validateEnv<T extends typeof EnvSchema | typeof EnvServerSchema>(schema: T): z.infer<T> {
  const result = schema.safeParse(getEnvs())

  if (result.success) return result.data

  const message = "Environment variables doesn't match type signature"
  console.error("\n\n\x1b[41m%s\x1b[0m", message)
  console.info("Type mismatch: ", result.error.toString())
  throw "Make sure you have all the required environment variables set"
}

function validateUrl(url: string) {
  try {
    new URL("", url)
    return true
  } catch {
    return false
  }
}

// Validating runtime on start-up for browser or server side
if (typeof window !== "undefined") {
  validateEnv(EnvSchema)
} else {
  validateEnv(EnvServerSchema)
}
