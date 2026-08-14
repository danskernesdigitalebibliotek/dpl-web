"use client"

import { type Loan, useLoans } from "@danskernesdigitalebibliotek/dpl-service-layer"

import { pidToFaust } from "@/lib/helpers/ids"

// The patron's loan for a manifestation, if any — matched on the FAUST
// record id. The service-layer hook is patron-gated, so nothing fires for
// Unilogin or anonymous sessions.
export const useExistingLoan = (pid: string): Loan | undefined => {
  const { data: loans } = useLoans()
  const recordId = pidToFaust(pid)
  return recordId ? loans?.find(loan => loan.recordId === recordId) : undefined
}
