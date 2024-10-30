// helper functions for environment variables.
export type TEnvironmentVariableOptions = "production" | "development" | "test" | null

export const getEnvironment = (): TEnvironmentVariableOptions => {
  return process.env.NODE_ENV || null
}
