"use client"

import loans from "@/lib/config/resolvers/loans"
import useGoConfig from "@/lib/config/useGoConfig"
import { type DueThresholds } from "@/lib/helpers/helper.due-status"

// Mirrors dpl-react's useLoanThresholds so loan status styling behaves the
// same across the platforms. Falls back to the resolver defaults while the
// config values load.
const useLoanThresholds = (): DueThresholds => {
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
