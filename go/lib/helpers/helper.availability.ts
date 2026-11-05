import { MaterialAvailability } from "@danskernesdigitalebibliotek/dpl-service-layer"

// The kommune holds copies, or FBS says the record is reservable anyway.
// A record FBS did not answer for counts as not obtainable.
// See docs/go/material-availability.md
export const isEditionObtainable = (
  availability: MaterialAvailability | undefined,
  recordId: string
): boolean => {
  const record = availability?.records[recordId]
  if (!record) return false

  return record.totalCopies > 0 || record.reservable
}

// The kommune holds copies but none is on the shelf - the ordinary "udlånt"
// state, which is still reservable.
export const isEditionOnLoan = (
  availability: MaterialAvailability | undefined,
  recordId: string
): boolean => {
  const record = availability?.records[recordId]
  if (!record) return false

  return record.totalCopies > 0 && record.availableCopies === 0
}

// How many are in queue for this edition, in Danish. Always states the
// count regardless of shelf availability — the picker shows this before the
// reader has chosen to reserve anything. Undefined for a record FBS did not
// answer for, which is the caller's cue to show no queue copy at all.
export const getEditionQueueCountText = (
  availability: MaterialAvailability | undefined,
  recordId: string
): string | undefined => {
  const record = availability?.records[recordId]
  if (!record) return undefined

  if (record.reservationCount === 0) return "Der er ingen i kø."

  const borrowers = record.reservationCount === 1 ? "låner" : "lånere"
  return `Der er ${record.reservationCount} ${borrowers} i kø.`
}
