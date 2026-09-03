import { z } from "zod"

import type { BiblioLoan } from "../../../src/types"

// Loans and reservations use the broad material type where metadata is
// restricted to ebook | audiobook.
export const MaterialTypeSchema = z.enum(["ebook", "audiobook", "paper_book"])

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
})

const GetLoansResponseSchema = z.object({
  loans: z.array(LoanSchema),
  pagination: z.object({
    cursor: z.string().optional(),
  }),
})

export function mapLoan(loan: z.infer<typeof LoanSchema>): BiblioLoan {
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
  }
}

export function parseAndMapLoans(raw: unknown): {
  loans: BiblioLoan[]
  nextCursor?: string
} {
  const parsed = GetLoansResponseSchema.parse(raw)
  return {
    loans: parsed.loans.map(mapLoan),
    nextCursor: parsed.pagination.cursor,
  }
}
