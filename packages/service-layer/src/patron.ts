import { type FbsConfig, createFbsClient } from "../fbs/src"
import type { Patron } from "./types"

export async function getPatron(config: { fbs: FbsConfig }): Promise<Patron | undefined> {
  const fbs = createFbsClient(config.fbs)
  return fbs.getPatron()
}
