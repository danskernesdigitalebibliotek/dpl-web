import { z } from "zod"

import type { MaterialAvailability } from "../../../src/types"

const HoldingsForRecordSchema = z.object({
  recordId: z.string(),
  reservations: z.number().int().nonnegative(),
  holdings: z.array(
    z.object({
      materials: z.array(z.unknown()),
    })
  ),
})

const HoldingsResponseSchema = z.array(HoldingsForRecordSchema)

export function parseAndMapAvailability(raw: unknown): MaterialAvailability {
  const parsed = HoldingsResponseSchema.parse(raw)

  return parsed.reduce<MaterialAvailability>(
    (acc, record) => ({
      totalCopies:
        acc.totalCopies +
        record.holdings.reduce((sum, placement) => sum + placement.materials.length, 0),
      reservationCount: acc.reservationCount + record.reservations,
    }),
    { totalCopies: 0, reservationCount: 0 }
  )
}
