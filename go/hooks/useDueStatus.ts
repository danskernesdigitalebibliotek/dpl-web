"use client"

import useLoanThresholds from "@/hooks/useLoanThresholds"
import { type DueStatus, dueStatus } from "@/lib/helpers/helper.due-status"

// Grades due dates against the configured thresholds. Returns a resolver so
// list components can grade many loans from one hook call.
const useDueStatus = (): ((dueDate: string) => DueStatus) => {
  const thresholds = useLoanThresholds()
  return dueDate => dueStatus(dueDate, thresholds)
}

export default useDueStatus
