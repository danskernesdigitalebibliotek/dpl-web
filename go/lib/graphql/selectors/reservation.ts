import type { Reservation } from "@danskernesdigitalebibliotek/dpl-service-layer"

// Find the patron's reservation for a given FAUST record id, if any.
export const getReservationByRecordId = (
  reservations: Reservation[] | undefined,
  recordId: string | null | undefined
): Reservation | undefined => {
  if (!recordId) return undefined
  return reservations?.find(r => r.recordId === recordId)
}
