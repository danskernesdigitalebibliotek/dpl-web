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
