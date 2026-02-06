import { getEnv } from "../config/env"

// If production set stale time to 1 minute, otherwise set to 0.
// Which means no caching in development.
export const getQueryClientStaleTime = () =>
  getEnv("NODE_ENV") === "production" ? 1 * 60 * 1000 : 0
