import { getEnv } from "@/lib/config/env"
import { isServer, isTest } from "@/lib/config/environmentChecks"

/**
 * Get base URL for the Go site itself.
 *
 * To avoid issues with the wrong value being inlined in the two-stage build
 * process, this will only generate absolute URLs for server-side usage,
 * in the browser we just return an empty string.
 */
export function getBaseURL() {
  if (isServer() || isTest()) {
    return getEnv("DPL_GO_BASE_URL")
  } else {
    return ""
  }
}
