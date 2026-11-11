"use client"

import type { UseQueryResult } from "@tanstack/react-query"

import { digitalReservationLimitsQuery } from "../queries/digital-reservation-limits"
import type { DigitalLoanQuota, DigitalReservationLimits } from "../types"
import { useDigitalQuery } from "./internal"
import { useDigitalLoanQuotas } from "./useDigitalLoanQuotas"

/**
 * What the patron may borrow and reserve, from the two endpoints that answer
 * it. The results stay apart rather than merging into one loading state, so
 * neither waits for the other.
 */
export const useDigitalQuotas = ({ enabled }: { enabled?: boolean } = {}): {
  loanQuotas: UseQueryResult<DigitalLoanQuota[], Error>
  reservationLimits: UseQueryResult<DigitalReservationLimits | null, Error>
} => {
  const loanQuotas = useDigitalLoanQuotas({ enabled })
  const reservationLimits = useDigitalQuery({
    query: digitalReservationLimitsQuery,
    options: { enabled },
  })

  return { loanQuotas, reservationLimits }
}
