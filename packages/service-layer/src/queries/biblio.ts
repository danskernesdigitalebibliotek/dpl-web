import { queryOptions } from "@tanstack/react-query"

import {
  getDigitalLoanQuotas,
  getDigitalLoans,
  getDigitalMaterial,
  getDigitalReservations,
  getLoanDecision,
  getReaderSignInToken,
  getSupportId,
} from "../biblio"
import type { ServiceLayerConfig } from "../types"

export const digitalLoansQueryKey = () => ["serviceLayer", "digitalLoans"] as const

export const digitalLoansQuery = (config: ServiceLayerConfig) =>
  queryOptions({
    queryKey: digitalLoansQueryKey(),
    queryFn: () => getDigitalLoans(config),
  })

export const digitalMaterialQueryKey = (isbn: string | null) =>
  ["serviceLayer", "digitalMaterial", isbn] as const

export const digitalMaterialQuery = (config: ServiceLayerConfig, isbn: string | null) =>
  queryOptions({
    queryKey: digitalMaterialQueryKey(isbn),
    queryFn: () => {
      if (isbn === null) {
        // The hook disables itself without an isbn; a direct caller of the
        // query options must not end up fetching /v1/metadata/null.
        throw new Error("digitalMaterialQuery cannot fetch without an isbn")
      }
      return getDigitalMaterial(config, isbn)
    },
  })

export const loanDecisionQueryKey = (materialId: string | null) =>
  ["serviceLayer", "digitalLoanDecision", materialId] as const

export const loanDecisionQuery = (
  config: ServiceLayerConfig,
  materialId: string | null,
  // TEMPORARY, with the toleration flag it serves. Deliberately not part of
  // the key: every caller derives it from the same site-wide setting, so two
  // values cannot meet within one page - and react invalidates by the plain
  // key, which a longer one would escape.
  options?: { allowNotFound?: boolean }
) =>
  queryOptions({
    queryKey: loanDecisionQueryKey(materialId),
    queryFn: () => {
      if (materialId === null) {
        // The hook disables itself without a material id; a direct caller of
        // the query options must not end up asking about "null".
        throw new Error("loanDecisionQuery cannot fetch without a material id")
      }
      return getLoanDecision(config, materialId, options)
    },
  })

export const digitalReservationsQueryKey = () => ["serviceLayer", "digitalReservations"] as const

export const digitalReservationsQuery = (config: ServiceLayerConfig) =>
  queryOptions({
    queryKey: digitalReservationsQueryKey(),
    queryFn: () => getDigitalReservations(config),
  })

export const digitalLoanQuotasQueryKey = () => ["serviceLayer", "digitalLoanQuotas"] as const

export const digitalLoanQuotasQuery = (config: ServiceLayerConfig) =>
  queryOptions({
    queryKey: digitalLoanQuotasQueryKey(),
    queryFn: () => getDigitalLoanQuotas(config),
  })

export const supportIdQueryKey = () => ["serviceLayer", "digitalSupportId"] as const

export const supportIdQuery = (config: ServiceLayerConfig) =>
  queryOptions({
    queryKey: supportIdQueryKey(),
    queryFn: () => getSupportId(config),
  })

export const readerSignInTokenQueryKey = () => ["serviceLayer", "readerSignInToken"] as const

export const readerSignInTokenQuery = (config: ServiceLayerConfig) =>
  queryOptions({
    queryKey: readerSignInTokenQueryKey(),
    queryFn: () => getReaderSignInToken(config),
    // The token expires, so it must not outlive its own window in the cache.
    // Refetching a minute early leaves room for the sign-in round trip that
    // follows, and the adapter is happy to mint another.
    staleTime: query => Math.max(0, ((query.state.data?.expiresInSeconds ?? 60) - 60) * 1000),
  })
