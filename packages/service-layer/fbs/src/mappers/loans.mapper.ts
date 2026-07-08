import { z } from "zod"

import type { Loan } from "../../../src/types"

const LoanDetailsSchema = z.object({
  loanId: z.number().int(),
  recordId: z.string(),
  dueDate: z.string(),
  loanDate: z.string(),
  materialItemNumber: z.string(),
})

const LoanSchema = z.object({
  isRenewable: z.boolean(),
  loanDetails: LoanDetailsSchema,
})

const LoansResponseSchema = z.array(LoanSchema)

export function parseAndMapLoans(raw: unknown): Loan[] {
  const parsed = LoansResponseSchema.parse(raw)
  return parsed.map(l => ({
    loanId: l.loanDetails.loanId,
    recordId: l.loanDetails.recordId,
    dueDate: l.loanDetails.dueDate,
    loanDate: l.loanDetails.loanDate,
    materialItemNumber: l.loanDetails.materialItemNumber,
    isRenewable: l.isRenewable,
  }))
}
