import { z } from "zod"

import type { BiblioReservation } from "../../../src/types"
import { MaterialTypeSchema } from "./loan.mapper"

const ReservationSchema = z.object({
  id: z.string(),
  material_id: z.string(),
  material_type: MaterialTypeSchema,
  timestamp: z.string(),
  loan_date: z.string(),
  offer_id: z.string().optional(),
  offer_expires_at: z.string().optional(),
})

const GetReservationsResponseSchema = z.object({
  reservations: z.array(ReservationSchema),
  pagination: z.object({
    cursor: z.string().optional(),
  }),
})

const DeleteReservationResponseSchema = z.object({
  success: z.boolean(),
})

const AcceptReservationOfferResponseSchema = z.object({
  success: z.boolean(),
  loan_id: z.string().optional(),
})

export function parseDeleteReservation(raw: unknown): boolean {
  return DeleteReservationResponseSchema.parse(raw).success
}

export function parseAndMapAcceptReservationOffer(raw: unknown): {
  success: boolean
  loanId?: string
} {
  const parsed = AcceptReservationOfferResponseSchema.parse(raw)
  return { success: parsed.success, loanId: parsed.loan_id }
}

export function parseAndMapReservations(raw: unknown): {
  reservations: BiblioReservation[]
  nextCursor?: string
} {
  const parsed = GetReservationsResponseSchema.parse(raw)
  return {
    reservations: parsed.reservations.map(reservation => ({
      reservationId: reservation.id,
      materialId: reservation.material_id,
      materialType: reservation.material_type,
      createdDate: reservation.timestamp,
      expectedLoanDate: reservation.loan_date,
      offerId: reservation.offer_id,
      offerExpiresAt: reservation.offer_expires_at,
    })),
    nextCursor: parsed.pagination.cursor,
  }
}
