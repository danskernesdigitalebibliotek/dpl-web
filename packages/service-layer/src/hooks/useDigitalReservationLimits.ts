"use client"

import type { UseQueryResult } from "@tanstack/react-query"

import {
  digitalReservationLimitsQuery,
  type digitalReservationLimitsQueryKey,
} from "../queries/digital-reservation-limits"
import type { DigitalReservationLimits } from "../types"
import { type DigitalQueryOptions, useDigitalQuery } from "./internal"

/**
 * How many reservations the patron's organization allows at once, per format.
 *
 * Takes the organization from the patron's loan quotas, so it follows them
 * rather than a second guess at which library the patron belongs to - and
 * stays off the wire until they have arrived.
 *
 * Not patron-scoped: the endpoint describes the organization, not the
 * patron. It is still gated on an organization id, and in practice only a
 * signed-in patron has one to pass.
 */
export const useDigitalReservationLimits = (
  organizationId: string | null,
  options?: DigitalQueryOptions<
    DigitalReservationLimits | null,
    ReturnType<typeof digitalReservationLimitsQueryKey>
  >
): UseQueryResult<DigitalReservationLimits | null, Error> =>
  useDigitalQuery({
    query: config => digitalReservationLimitsQuery(config, organizationId),
    options,
    patronScoped: false,
    requires: Boolean(organizationId),
  })
