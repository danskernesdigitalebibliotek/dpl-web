import { validateAllEnvs } from "@/lib/config/env"

export function register() {
  // Validate environment variables once, when the server starts.
  validateAllEnvs()
}
