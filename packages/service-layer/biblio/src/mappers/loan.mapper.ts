import { z } from "zod"

import type { DigitalLoan } from "../../../src/types"

// Loans and reservations use the broad material type where metadata is
// restricted to ebook | audiobook.
export const MaterialTypeSchema = z.enum(["ebook", "audiobook", "paper_book"])

// The licence types a loan can be made under. "selection" (Danish blue
// titles) costs the patron nothing and draws on no quota; the rest are ways
// the library pays for a loan that still counts against the patron's quota.
// See LoanProvider for where the unused "free" sits.
export const LoanProviderSchema = z.enum([
  "free",
  "k-fond",
  "click",
  "package",
  "premium",
  "selection",
])

// We only read the fields consumers need; zod strips unknown keys so new
// fields in the adapter responses do not break parsing. What we do read
// follows the contract: every field below is required there, so a response
// missing one is a contract breach and throws.
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
  // Which licence the loan was made under - what identifies a cost-free
  // loan, the kind that draws on no quota.
  license: z.object({ type: LoanProviderSchema }),
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
    author: loan.author,
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
