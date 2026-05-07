/* eslint-disable no-restricted-properties */
import {
  PHASE_DEVELOPMENT_SERVER,
  PHASE_EXPORT,
  PHASE_PRODUCTION_BUILD,
  PHASE_PRODUCTION_SERVER,
  PHASE_TEST,
} from "next/constants"
import { ZodObject, z } from "zod"

function getEnvs() {
  return {
    // Public environment variables.
    APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    CODEGEN_LIBRARY_TOKEN: process.env.NEXT_PUBLIC_CODEGEN_LIBRARY_TOKEN,
    CODEGEN_GRAPHQL_SCHEMA_ENDPOINT_FBI: process.env.CODEGEN_GRAPHQL_SCHEMA_ENDPOINT_FBI,
    DPL_CMS_HOSTNAME: process.env.NEXT_PUBLIC_DPL_CMS_HOSTNAME,
    GO_GRAPHQL_CONSUMER_USER_NAME: process.env.NEXT_PUBLIC_GO_GRAPHQL_CONSUMER_USER_NAME,
    GO_GRAPHQL_CONSUMER_USER_PASSWORD: process.env.NEXT_PUBLIC_GO_GRAPHQL_CONSUMER_USER_PASSWORD,
    GRAPHQL_SCHEMA_ENDPOINT_DPL_CMS: process.env.NEXT_PUBLIC_GRAPHQL_SCHEMA_ENDPOINT_DPL_CMS,
    NODE_ENV: process.env.NODE_ENV,
    TEST_MODE: process.env.TEST_MODE,

    // Server-only environment variables.
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
    UNILOGIN_INST_REG_UID: process.env.UNILOGIN_INST_REG_UID,
    UNILOGIN_INST_REG_PWD: process.env.UNILOGIN_INST_REG_PWD,
    UNILOGIN_INST_REG_URL: process.env.UNILOGIN_INST_REG_URL,
  }
}

const EnvPublicSchema = z.object({
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

// Environment variables only available in Node.js.
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
  UNILOGIN_INST_REG_UID: z.string().optional(),
  UNILOGIN_INST_REG_PWD: z.string().optional(),
  UNILOGIN_INST_REG_URL: z.string().refine(validateUrl).optional(),
  // Is fetched from dpl-cms, but can be overridden by env vars
  UNILOGIN_CLIENT_ID: z.string().optional(),
  UNILOGIN_CLIENT_SECRET: z.string().optional(),
  UNILOGIN_WELLKNOWN_URL: z.string().refine(validateUrl).optional(),
})

type EnvPublicSchemaResult = z.infer<typeof EnvPublicSchema>
type EnvServerSchemaResult = z.infer<typeof EnvServerSchema>

let memoizedPublicEnvs: EnvPublicSchemaResult
let memoizedServerEnvs: EnvServerSchemaResult

/**
 * Get a variable from the public schema.
 */
export function getEnv<T extends keyof EnvPublicSchemaResult>(key: T): EnvPublicSchemaResult[T] {
  if (!memoizedPublicEnvs || skipMemoization()) {
    memoizedPublicEnvs = validateEnv(EnvPublicSchema)
  }

  return memoizedPublicEnvs[key]
}

/**
 * Get a variable from the server schema.
 */
export function getServerEnv<T extends keyof EnvServerSchemaResult>(
  key: T
): EnvServerSchemaResult[T] {
  if (!memoizedServerEnvs || skipMemoization()) {
    memoizedServerEnvs = validateEnv(EnvServerSchema)
  }

  return memoizedServerEnvs[key]
}

/**
 * Validate both server and client environment variables.
 *
 * To be run when the Next.js server starts.
 */
export function validateAllEnvs() {
  validateEnv(EnvPublicSchema)
  validateEnv(EnvServerSchema)
}

function validateEnv(schema: typeof EnvPublicSchema): EnvPublicSchemaResult
function validateEnv(schema: typeof EnvServerSchema): EnvServerSchemaResult
function validateEnv(
  schema: typeof EnvPublicSchema | typeof EnvServerSchema
): EnvPublicSchemaResult | EnvServerSchemaResult {
  let derivedSchema: ZodObject = schema

  if (!enforceRequiredVariables()) {
    derivedSchema = schema.partial()
  }

  const result = derivedSchema.safeParse(getEnvs())

  if (!result.success) {
    console.error("Environment variables do not match validation schema.")
    console.info("Type mismatch: ", result.error.toString())
    throw new Error("Make sure you have all the required environment variables set.")
  }

  return result.data as z.infer<typeof schema>
}

function validateUrl(url: string) {
  try {
    new URL("", url)
    return true
  } catch {
    return false
  }
}

/**
 * Return true if we should enforce required variables.
 *
 * Skips the enforcement when building shared images or in tests.
 */
export const enforceRequiredVariables = () => {
  const phase = process.env["NEXT_PHASE"]

  return (
    phase === PHASE_DEVELOPMENT_SERVER ||
    phase === PHASE_EXPORT ||
    phase === PHASE_PRODUCTION_SERVER
  )
}

/**
 * Return true if we should skip memoization.
 *
 * Memoization does not work well inside vitest, since it is not cleared between
 * tests, and we therefore cannot make tests where we modify the environment to
 * trigger validation errors.
 */
const skipMemoization = () => process.env.NODE_ENV === "test"
