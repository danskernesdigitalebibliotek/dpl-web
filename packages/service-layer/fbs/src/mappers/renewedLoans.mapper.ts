import { z } from "zod"

import type { RenewedLoan } from "../../../src/types"

const RenewedLoanSchema = z.object({
  loanDetails: z.object({
    loanId: z.number().int(),
    recordId: z.string(),
    dueDate: z.string(),
  }),
  renewalStatus: z.array(z.string()),
})

const RenewedLoansResponseSchema = z.array(RenewedLoanSchema)

export function parseAndMapRenewedLoans(raw: unknown): RenewedLoan[] {
  const parsed = RenewedLoansResponseSchema.parse(raw)
  return parsed.map(l => ({
    loanId: l.loanDetails.loanId,
    recordId: l.loanDetails.recordId,
    dueDate: l.loanDetails.dueDate,
    // FBS signals the outcome per loan as a status list; "renewed" marks
    // success, anything else is a denial reason (e.g. deniedReserved).
    renewed: l.renewalStatus.some(status => status.toLowerCase() === "renewed"),
  }))
}
