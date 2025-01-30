import { getEnvironment } from "./helper.env"

// If production set stale time to 1 minute, otherwise set to 0.
// Which means no caching in development.
export const getQueryClientStaleTime = () => (getEnvironment() === "production" ? 1 * 60 * 1000 : 0)
