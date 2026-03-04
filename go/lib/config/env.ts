/* eslint-disable no-restricted-properties */
import {
  PHASE_DEVELOPMENT_SERVER,
  PHASE_EXPORT,
  PHASE_PRODUCTION_BUILD,
  PHASE_PRODUCTION_SERVER,
  PHASE_TEST,
} from "next/constants"
import { z } from "zod"

function getEnvs() {
  return {
    // Public env variables
    APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    CODEGEN_LIBRARY_TOKEN: process.env.NEXT_PUBLIC_CODEGEN_LIBRARY_TOKEN,
    CODEGEN_GRAPHQL_SCHEMA_ENDPOINT_FBI: process.env.CODEGEN_GRAPHQL_SCHEMA_ENDPOINT_FBI,
    DPL_CMS_HOSTNAME: process.env.NEXT_PUBLIC_DPL_CMS_HOSTNAME,
    GO_GRAPHQL_CONSUMER_USER_NAME: process.env.NEXT_PUBLIC_GO_GRAPHQL_CONSUMER_USER_NAME,
    GO_GRAPHQL_CONSUMER_USER_PASSWORD: process.env.NEXT_PUBLIC_GO_GRAPHQL_CONSUMER_USER_PASSWORD,
    GRAPHQL_SCHEMA_ENDPOINT_DPL_CMS: process.env.NEXT_PUBLIC_GRAPHQL_SCHEMA_ENDPOINT_DPL_CMS,
    NODE_ENV: process.env.NODE_ENV,
    TEST_MODE: process.env.TEST_MODE,

    // Server-only env variables
    DRUPAL_REVALIDATE_SECRET: process.env.DRUPAL_REVALIDATE_SECRET,
    GO_SESSION_SECRET: process.env.GO_SESSION_SECRET,
    NEXT_PHASE: process.env.NEXT_PHASE,
    UNILOGIN_CLIENT_ID: process.env.UNILOGIN_CLIENT_ID,
    UNILOGIN_CLIENT_SECRET: process.env.UNILOGIN_CLIENT_SECRET,
    UNILOGIN_MUNICIPALITY_ID: process.env.UNILOGIN_MUNICIPALITY_ID,
    UNILOGIN_WELLKNOWN_URL: process.env.UNILOGIN_WELLKNOWN_URL,
    UNLILOGIN_PUBHUB_CLIENT_ID: process.env.UNLILOGIN_PUBHUB_CLIENT_ID,
    UNLILOGIN_PUBHUB_RETAILER_ID: process.env.UNLILOGIN_PUBHUB_RETAILER_ID,
    UNLILOGIN_PUBHUB_RETAILER_KEY_CODE: process.env.UNLILOGIN_PUBHUB_RETAILER_KEY_CODE,
    UNLILOGIN_SERVICES_WS_PASSWORD: process.env.UNLILOGIN_SERVICES_WS_PASSWORD,
    UNLILOGIN_SERVICES_WS_USER: process.env.UNLILOGIN_SERVICES_WS_USER,
  }
}

const EnvSchema = z.object({
  APP_URL: z.string().refine(validateUrl),
  CODEGEN_LIBRARY_TOKEN: z.string().optional(),
  CODEGEN_GRAPHQL_SCHEMA_ENDPOINT_FBI: z.string().refine(validateUrl).optional(),
  DPL_CMS_HOSTNAME: z.string(),
  GO_GRAPHQL_CONSUMER_USER_NAME: z.string(),
  GO_GRAPHQL_CONSUMER_USER_PASSWORD: z.string(),
  GRAPHQL_SCHEMA_ENDPOINT_DPL_CMS: z.string().refine(validateUrl),
  NODE_ENV: z.union([z.literal("development"), z.literal("production"), z.literal("test")]),
  TEST_MODE: z.coerce.boolean().default(false),
})

// Environment variables only available in Nodejs.
// Should only be fetched with getServerEnv().
const EnvServerSchema = z.object({
  DRUPAL_REVALIDATE_SECRET: z.string(),
  GO_SESSION_SECRET: z.string().min(32),
  NEXT_PHASE: z
    .union([
      z.literal(PHASE_DEVELOPMENT_SERVER),
      z.literal(PHASE_EXPORT),
      z.literal(PHASE_PRODUCTION_BUILD),
      z.literal(PHASE_PRODUCTION_SERVER),
      z.literal(PHASE_TEST),
    ])
    .optional(),
  UNILOGIN_MUNICIPALITY_ID: z.string().optional(),
  UNLILOGIN_PUBHUB_CLIENT_ID: z.string(),
  UNLILOGIN_PUBHUB_RETAILER_ID: z.string(),
  UNLILOGIN_PUBHUB_RETAILER_KEY_CODE: z.string().optional(),
  UNLILOGIN_SERVICES_WS_PASSWORD: z.string().optional(),
  UNLILOGIN_SERVICES_WS_USER: z.string().optional(),
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

function validateEnv<T extends z.ZodSchema>(schema: T): z.infer<T> {
  const result = schema.safeParse(getEnvs())

  if (result.success) return result.data

  const message = "Environment variables doesn't match type signature"
  console.error("\n\n\x1b[41m%s\x1b[0m", message)
  console.info("Type mismatch: ", result.error.toString())
  throw new Error("Make sure you have all the required environment variables set")
}

function validateUrl(url: string) {
  try {
    new URL("", url)
    return true
  } catch {
    return false
  }
}

// If SKIP_ENV_VALIDATION is set to "1", we skip env validation.
const shouldValidateEnv = process.env?.SKIP_ENV_VALIDATION !== "1"
if (shouldValidateEnv) {
  if (typeof window !== "undefined") {
    // Validating envs for client-side
    validateEnv(EnvSchema)
  } else {
    // Validating envs for server-side
    validateEnv(EnvServerSchema)
  }
}
