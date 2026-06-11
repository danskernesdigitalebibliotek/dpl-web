import { z } from "zod"

import type { CreateReservationResult } from "../../../src/types"

const ReservationDetailsSchema = z.object({
  reservationId: z.number().int(),
  pickupBranch: z.string(),
  numberInQueue: z.number().int().optional(),
})

const ReservationResultSchema = z.object({
  recordId: z.string(),
  result: z.string(),
  reservationDetails: ReservationDetailsSchema.optional(),
})

const ReservationResponseSchema = z.object({
  success: z.boolean(),
  reservationResults: z.array(ReservationResultSchema),
})

export function parseAndMapReservation(raw: unknown): CreateReservationResult {
  const parsed = ReservationResponseSchema.parse(raw)
  const first = parsed.reservationResults[0]
  if (!first) {
    throw new Error("FBS reservation response contained no results")
  }

  if (parsed.success && first.reservationDetails) {
    return {
      status: "success",
      recordId: first.recordId,
      reservationId: first.reservationDetails.reservationId,
      pickupBranchId: first.reservationDetails.pickupBranch,
      numberInQueue: first.reservationDetails.numberInQueue,
    }
  }

  return {
    status: "failed",
    recordId: first.recordId,
    reason: first.result,
  }
}
