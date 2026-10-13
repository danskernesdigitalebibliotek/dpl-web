import { z } from "zod"

import type { MaterialAvailability } from "../../../src/types"

const HoldingsForRecordSchema = z.object({
  recordId: z.string(),
  reservations: z.number().int().nonnegative(),
  // Defaulted, not required: an older FBS adapter omitting it must not fail
  // the whole parse. The default is the permissive answer.
  reservable: z.boolean().catch(true),
  holdings: z.array(
    z.object({
      // Per copy: on the shelf or lent out. Defaulted like `reservable`.
      materials: z.array(z.object({ available: z.boolean().catch(true) })),
    })
  ),
})

const HoldingsResponseSchema = z.array(HoldingsForRecordSchema)

export function parseAndMapAvailability(raw: unknown): MaterialAvailability {
  const parsed = HoldingsResponseSchema.parse(raw)

  const availability: MaterialAvailability = {
    totalCopies: 0,
    reservationCount: 0,
    records: {},
  }

  for (const record of parsed) {
    const materials = record.holdings.flatMap(placement => placement.materials)
    const copies = materials.length
    const availableCopies = materials.filter(material => material.available).length

    availability.totalCopies += copies
    availability.reservationCount += record.reservations
    availability.records[record.recordId] = {
      recordId: record.recordId,
      totalCopies: copies,
      availableCopies,
      reservationCount: record.reservations,
      reservable: record.reservable,
    }
  }

  return availability
}
