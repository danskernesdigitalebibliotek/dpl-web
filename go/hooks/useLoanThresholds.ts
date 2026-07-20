"use client"

import loans from "@/lib/config/resolvers/loans"
import useGoConfig from "@/lib/config/useGoConfig"

type LoanThresholds = {
  // Days before due date where the loan should be highlighted as a warning.
  warning: number
  // Days before due date where the loan is due now / overdue.
  danger: number
  // Days before due date from which Cicero allows renewing the loan.
  renewalWindow: number
}

// Mirrors dpl-react's useLoanThresholds so loan status styling behaves the
// same across the platforms. Falls back to the resolver defaults while the
// config values load.
const useLoanThresholds = (): LoanThresholds => {
  const config = useGoConfig([
    "loans.threshold.warning",
    "loans.threshold.danger",
    "loans.renewal-window",
  ])
  return {
    warning: Number(config?.["loans.threshold.warning"] ?? loans["loans.threshold.warning"]),
    danger: Number(config?.["loans.threshold.danger"] ?? loans["loans.threshold.danger"]),
    renewalWindow: Number(config?.["loans.renewal-window"] ?? loans["loans.renewal-window"]),
  }
}

export default useLoanThresholds
