import { z } from "zod"

import type { DigitalLoan } from "../../../src/types"
import { LoanProvider, MaterialType } from "../generated/model"
import { openEnum } from "./open-enum"

export const MaterialTypeSchema = openEnum("material_type", Object.values(MaterialType))

// zod strips unknown keys, so new adapter fields do not break parsing. Every
// field below is required by the contract, so a missing one throws; the enum
// fields are open - see openEnum.
export const LoanSchema = z.object({
  id: z.string(),
  material_id: z.string(),
  material_type: MaterialTypeSchema,
  start: z.string(),
  end: z.string(),
  active: z.boolean(),
  title: z.string(),
  author: z.string(),
  publisher: z.string(),
  publish_date: z.string(),
  license: z.object({ type: openEnum("license.type", Object.values(LoanProvider)) }),
})

const GetLoansResponseSchema = z.object({
  loans: z.array(LoanSchema),
  pagination: z.object({
    cursor: z.string().optional(),
  }),
})

export function mapLoan(loan: z.infer<typeof LoanSchema>): DigitalLoan {
  return {
    loanId: loan.id,
    materialId: loan.material_id,
    materialType: loan.material_type,
    startDate: loan.start,
    endDate: loan.end,
    active: loan.active,
    title: loan.title,
    // The provider names one creator; the catalogue replaces this with every
    // creator it credits.
    authors: loan.author ? [loan.author] : [],
    publisher: loan.publisher,
    publishDate: loan.publish_date,
    loanProvider: loan.license.type,
  }
}

export function parseAndMapLoans(raw: unknown): {
  loans: DigitalLoan[]
  nextCursor?: string
} {
  const parsed = GetLoansResponseSchema.parse(raw)
  return {
    loans: parsed.loans.map(mapLoan),
    nextCursor: parsed.pagination.cursor,
  }
}
