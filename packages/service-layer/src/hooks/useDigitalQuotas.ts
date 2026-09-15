"use client"

import type { UseQueryResult } from "@tanstack/react-query"

import { getDigitalQuotaOrganizationId } from "../digital-quotas"
import { digitalReservationLimitsQuery } from "../queries/digital-reservation-limits"
import type { DigitalLoanQuota, DigitalReservationLimits } from "../types"
import { useDigitalQuery } from "./internal"
import { useDigitalLoanQuotas } from "./useDigitalLoanQuotas"

/**
 * What the patron may borrow and reserve, from the two endpoints that answer
 * it. The ceiling has no hook of its own: its endpoint is not patron-scoped,
 * and the only source of an organization is the quotas beside it.
 *
 * The results stay apart rather than merging into one loading state - the
 * ceiling is a round trip behind the quotas, and the loans should not wait
 * for it.
 */
export const useDigitalQuotas = ({ enabled }: { enabled?: boolean } = {}): {
  loanQuotas: UseQueryResult<DigitalLoanQuota[], Error>
  reservationLimits: UseQueryResult<DigitalReservationLimits | null, Error>
} => {
  const loanQuotas = useDigitalLoanQuotas({ enabled })
  const organizationId = getDigitalQuotaOrganizationId(loanQuotas.data)

  const reservationLimits = useDigitalQuery({
    query: config => digitalReservationLimitsQuery(config, organizationId),
    options: { enabled },
    patronScoped: false,
    requires: Boolean(organizationId),
  })

  return { loanQuotas, reservationLimits }
}
