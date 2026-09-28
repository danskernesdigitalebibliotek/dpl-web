import { MaterialAvailability } from "@danskernesdigitalebibliotek/dpl-service-layer"

// Whether the kommune has anything to offer for this edition: it owns copies,
// or FBS says the record is reservable anyway (a record obtainable from
// another library is reservable without the agency holding a copy).
//
// A record FBS did not answer for counts as not obtainable. When the kommune
// genuinely holds nothing FBS says so explicitly (the record comes back with
// no holdings), so silence means we cannot vouch for the edition — and an
// edition that turns out to be unreservable is a dead end a child cannot make
// sense of. Better to leave it out than to offer something that fails.
export const isEditionObtainable = (
  availability: MaterialAvailability | undefined,
  recordId: string
): boolean => {
  const record = availability?.records[recordId]
  if (!record) return false

  return record.totalCopies > 0 || record.reservable
}

// The kommune owns copies but none is on the shelf. This is the ordinary
// "udlånt" state: the edition is worth showing, and reserving it is the right
// thing to do, since that is how the patron joins the queue.
export const isEditionOnLoan = (
  availability: MaterialAvailability | undefined,
  recordId: string
): boolean => {
  const record = availability?.records[recordId]
  if (!record) return false

  return record.totalCopies > 0 && record.availableCopies === 0
}
