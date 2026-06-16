import { z } from "zod"

import type { Reservation } from "../../../src/types"

const ReservationDetailsSchema = z.object({
  recordId: z.string(),
  reservationId: z.number().int(),
  pickupBranch: z.string(),
  numberInQueue: z.number().int().nullish(),
  state: z.string(),
})

const ReservationsResponseSchema = z.array(ReservationDetailsSchema)

export function parseAndMapReservations(raw: unknown): Reservation[] {
  const parsed = ReservationsResponseSchema.parse(raw)
  return parsed.map(r => ({
    reservationId: r.reservationId,
    recordId: r.recordId,
    pickupBranchId: r.pickupBranch,
    numberInQueue: r.numberInQueue ?? undefined,
    state: r.state,
  }))
}
