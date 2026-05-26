import { createFbsClient, type FbsConfig } from "../fbs/src"
import type { AuthenticatedPatron } from "./types"

export async function getPatron(config: {
  fbs: FbsConfig
}): Promise<AuthenticatedPatron> {
  const fbs = createFbsClient(config.fbs)
  return fbs.getPatron()
}
