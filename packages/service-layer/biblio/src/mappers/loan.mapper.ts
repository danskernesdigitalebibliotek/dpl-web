import { z } from "zod"

import type { BiblioLoan } from "../../../src/types"

// Loans and reservations use the broad material type where metadata is
// restricted to ebook | audiobook.
export const MaterialTypeSchema = z.enum(["ebook", "audiobook", "paper_book"])

// We only read the fields consumers need; zod strips unknown keys so new
// fields in the adapter responses do not break parsing.
//
// The catalogue fields are marked required in the contract but read as
// optional here on purpose: a loan missing its publisher should render
// incompletely rather than break the whole list.
export const LoanSchema = z.object({
  id: z.string(),
  material_id: z.string(),
  material_type: MaterialTypeSchema,
  start: z.string(),
  end: z.string(),
  active: z.boolean(),
  title: z.string().optional(),
  author: z.string().optional(),
  publisher: z.string().optional(),
  publish_date: z.string().optional(),
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
