"use client"

import type { UseQueryResult } from "@tanstack/react-query"

import { digitalLoanQuotasQuery, type digitalLoanQuotasQueryKey } from "../queries/biblio"
import type { DigitalLoanQuota } from "../types"
import { type DigitalQueryOptions, useDigitalQuery } from "./internal"

export const useDigitalLoanQuotas = (
  options?: DigitalQueryOptions<DigitalLoanQuota[], ReturnType<typeof digitalLoanQuotasQueryKey>>
): UseQueryResult<DigitalLoanQuota[], Error> =>
  useDigitalQuery({ query: digitalLoanQuotasQuery, options })
