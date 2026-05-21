import { createFbsClient, type FbsConfig } from "../fbs/src"
import type { AuthenticatedPatronInfo } from "./types"

export async function getPatron(config: {
  fbs: FbsConfig
}): Promise<AuthenticatedPatronInfo> {
  const fbs = createFbsClient(config.fbs)
  return fbs.getPatronInfo()
}
