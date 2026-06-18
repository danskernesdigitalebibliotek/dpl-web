import { z } from "zod"

import type { CreateReservationResult, FailureReason } from "../../../src/types"
import { RESERVATION_FAILURE_REASONS } from "../../../src/types"

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

const KNOWN_REASONS = new Set<string>(RESERVATION_FAILURE_REASONS)

// FBS may emit codes with mixed case or future additions ("material_Discarded"
// in the spec). Lowercase, then fall back to "unknown" for anything unrecognised
// so callers can render a generic message without a type widening.
const coerceReason = (raw: string): FailureReason => {
  const lower = raw.toLowerCase()
  return KNOWN_REASONS.has(lower) ? (lower as FailureReason) : "unknown"
}

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
    reason: coerceReason(first.result),
  }
}
