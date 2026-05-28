import { z } from "zod"

import type { Patron } from "../../../src/types"

const FbsPatronResponseSchema = z.object({
  authenticateStatus: z.enum(["VALID", "INVALID", "LOANER_LOCKED_OUT"]),
  patron: z
    .object({
      name: z.string().optional(),
    })
    .optional(),
})

export function parseAndMapPatron(raw: unknown): Patron | undefined {
  const parsed = FbsPatronResponseSchema.parse(raw)
  if (!parsed.patron) return undefined
  return {
    name: parsed.patron.name,
    isLocked: parsed.authenticateStatus === "LOANER_LOCKED_OUT",
  }
}
