import { createFbsClient } from "../fbs/src"
import type { FbsConfig } from "../fbs/src/types"
import type { Availability } from "./types"

export type GetAvailabilityArgs = {
  fbs: FbsConfig
  faustIds: string[]
  excludeBranches?: string[]
}

export async function getAvailability(args: GetAvailabilityArgs): Promise<Availability[]> {
  const client = createFbsClient(args.fbs)
  return client.getAvailability({
    faustIds: args.faustIds,
    excludeBranches: args.excludeBranches,
  })
}
