import { z } from "zod"

import type { Availability } from "../../../src/types"

const FbsAvailabilityV3Schema = z.object({
  available: z.boolean(),
  recordId: z.string(),
  reservable: z.boolean(),
  reservations: z.number().int(),
})

const FbsAvailabilityV3ListSchema = z.array(FbsAvailabilityV3Schema)

export function parseAndMapAvailability(raw: unknown): Availability[] {
  return FbsAvailabilityV3ListSchema.parse(raw).map(entry => ({
    faustId: entry.recordId,
    isAvailable: entry.available,
    isReservable: entry.reservable,
    reservationCount: entry.reservations,
  }))
}
