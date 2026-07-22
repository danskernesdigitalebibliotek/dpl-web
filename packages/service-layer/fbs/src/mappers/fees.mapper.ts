import { z } from "zod"

import type { Fee } from "../../../src/types"

const FeeSchema = z.object({
  feeId: z.number().int(),
  amount: z.number(),
  creationDate: z.string(),
  dueDate: z.string().nullish(),
  reasonMessage: z.string(),
  type: z.string(),
  payableByClient: z.boolean(),
  // Absent when the fee's materials no longer exist (closed interlibrary loans).
  materials: z.array(z.unknown()).nullish(),
})

const FeesResponseSchema = z.array(FeeSchema)

export function parseAndMapFees(raw: unknown): Fee[] {
  const parsed = FeesResponseSchema.parse(raw)
  return parsed.map(f => ({
    feeId: f.feeId,
    amount: f.amount,
    creationDate: f.creationDate,
    dueDate: f.dueDate ?? undefined,
    reasonMessage: f.reasonMessage,
    type: f.type,
    payableByClient: f.payableByClient,
    materialCount: f.materials?.length ?? 0,
  }))
}
