import { z } from "zod"

import type { RenewalFailureReason, RenewedLoan } from "../../../src/types"
import { RENEWAL_FAILURE_REASONS } from "../../../src/types"

const RenewedLoanSchema = z.object({
  loanDetails: z.object({
    loanId: z.number().int(),
    recordId: z.string(),
    dueDate: z.string(),
  }),
  renewalStatus: z.array(z.string()),
})

const RenewedLoansResponseSchema = z.array(RenewedLoanSchema)

const KNOWN_REASONS = new Map(RENEWAL_FAILURE_REASONS.map(reason => [reason.toLowerCase(), reason]))

// Pick the most specific documented denial code. FBS can send the generic
// code alongside a specific one, so deniedOtherReason only wins when
// nothing specific is present. Shared with the loans mapper.
export const coerceReason = (statuses: string[]): RenewalFailureReason => {
  for (const status of statuses) {
    const known = KNOWN_REASONS.get(status.toLowerCase())
    if (known && known !== "deniedOtherReason") return known
  }
  return "deniedOtherReason"
}

export function parseAndMapRenewedLoans(raw: unknown): RenewedLoan[] {
  const parsed = RenewedLoansResponseSchema.parse(raw)
  return parsed.map(l => {
    const base = {
      loanId: l.loanDetails.loanId,
      recordId: l.loanDetails.recordId,
      dueDate: l.loanDetails.dueDate,
    }
    // FBS signals the outcome per loan as a status list; "renewed" marks
    // success, anything else is a denial reason (e.g. deniedReserved).
    if (l.renewalStatus.some(status => status.toLowerCase() === "renewed")) {
      return { ...base, renewed: true }
    }
    return { ...base, renewed: false, reason: coerceReason(l.renewalStatus) }
  })
}
