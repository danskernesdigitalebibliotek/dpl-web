import { MaterialAvailability } from "@danskernesdigitalebibliotek/dpl-service-layer"

import { isPhysicalMaterialType } from "@/components/pages/workPageLayout/helper"
import { ManifestationWorkPageFragment } from "@/lib/graphql/generated/fbi/graphql"
import { pidToFaust } from "@/lib/helpers/ids"

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

// The record FBS can answer for, or null when it cannot: a digital edition
// has none, and an unresolved answer speaks for nothing.
export const getManifestationRecordId = (
  manifestation: ManifestationWorkPageFragment,
  isResolved: boolean
): string | null => {
  if (!isResolved) return null
  if (!isPhysicalMaterialType(manifestation.materialTypes[0]?.materialTypeSpecific.code)) {
    return null
  }

  return pidToFaust(manifestation.pid)
}

// Nothing to borrow and nothing to reserve. False for anything the
// availability cannot speak for, which keeps the edition visible.
export const isManifestationUnobtainable = (
  manifestation: ManifestationWorkPageFragment,
  availability: MaterialAvailability | undefined,
  isResolved: boolean
): boolean => {
  const recordId = getEditionRecordId(manifestation, isResolved)
  if (!recordId) return false

  return !isEditionObtainable(availability, recordId)
}

// Held but every copy is out. Still reservable.
export const isManifestationLentOut = (
  manifestation: ManifestationWorkPageFragment,
  availability: MaterialAvailability | undefined,
  isResolved: boolean
): boolean => {
  const recordId = getEditionRecordId(manifestation, isResolved)
  if (!recordId) return false

  return isEditionOnLoan(availability, recordId)
}

// Undefined for an edition the availability cannot speak for — callers fall
// back to no queue copy.
export const getManifestationQueueText = (
  manifestation: ManifestationWorkPageFragment,
  availability: MaterialAvailability | undefined,
  isResolved: boolean
): string | undefined => {
  const recordId = getEditionRecordId(manifestation, isResolved)
  if (!recordId) return undefined

  return getEditionQueueCountText(availability, recordId)
}

// The editions of a type the reader can choose between: the kommune's
// unobtainable ones are left out, lent-out ones stay.
export const getShownEditions = (
  editions: ManifestationWorkPageFragment[],
  availability: MaterialAvailability | undefined,
  isResolved: boolean
): ManifestationWorkPageFragment[] =>
  editions.filter(
    manifestation => !isManifestationUnobtainable(manifestation, availability, isResolved)
  )
