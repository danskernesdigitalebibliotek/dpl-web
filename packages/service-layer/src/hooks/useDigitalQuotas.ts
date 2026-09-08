"use client"

import type { UseQueryResult } from "@tanstack/react-query"

import { getDigitalQuotaOrganizationId } from "../digital-quotas"
import type { DigitalLoanQuota, DigitalReservationLimits } from "../types"
import { useDigitalLoanQuotas } from "./useDigitalLoanQuotas"
import { useDigitalReservationLimits } from "./useDigitalReservationLimits"

/**
 * Everything the adapter knows about what the patron may borrow and reserve.
 *
 * The two arrive from endpoints of their own: the loan quotas describe the
 * patron and carry both usage and limits, the reservation ceiling describes
 * the organization and carries a limit only. The organization is the one the
 * quotas were issued for, so the ceiling belongs to the same library as the
 * numbers beside it - the caller does not have to name it, or know that the
 * ceiling is a round trip further out.
 *
 * The two results stay apart rather than merging into one loading state.
 * Nothing about the loans should wait for a ceiling that cannot be asked for
 * until the quotas have answered, so the consumer chooses what to wait for.
 */
export const useDigitalQuotas = ({
  enabled,
}: { enabled?: boolean } = {}): {
  quotas: UseQueryResult<DigitalLoanQuota[], Error>
  reservationLimits: UseQueryResult<DigitalReservationLimits | null, Error>
} => {
  const quotas = useDigitalLoanQuotas({ enabled })
  const reservationLimits = useDigitalReservationLimits(
    getDigitalQuotaOrganizationId(quotas.data),
    { enabled }
  )

  return { quotas, reservationLimits }
}
