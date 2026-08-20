import { queryOptions } from "@tanstack/react-query"

import {
  getBiblioCanLoan,
  getBiblioLoanQuotas,
  getBiblioLoans,
  getBiblioMaterial,
  getBiblioReservations,
  getBiblioSupportId,
} from "../biblio"
import type { ServiceLayerConfig } from "../types"

export const biblioLoansQueryKey = () => ["serviceLayer", "biblioLoans"] as const

export const biblioLoansQuery = (config: ServiceLayerConfig) =>
  queryOptions({
    queryKey: biblioLoansQueryKey(),
    queryFn: () => getBiblioLoans(config),
  })

export const biblioMaterialQueryKey = (isbn: string | null) =>
  ["serviceLayer", "biblioMaterial", isbn] as const

export const biblioMaterialQuery = (config: ServiceLayerConfig, isbn: string | null) =>
  queryOptions({
    queryKey: biblioMaterialQueryKey(isbn),
    queryFn: () => {
      if (isbn === null) {
        // The hook disables itself without an isbn; a direct caller of the
        // query options must not end up fetching /v1/metadata/null.
        throw new Error("biblioMaterialQuery cannot fetch without an isbn")
      }
      return getBiblioMaterial(config, isbn)
    },
  })

export const biblioCanLoanQueryKey = (materialId: string | null) =>
  ["serviceLayer", "biblioCanLoan", materialId] as const

export const biblioCanLoanQuery = (config: ServiceLayerConfig, materialId: string | null) =>
  queryOptions({
    queryKey: biblioCanLoanQueryKey(materialId),
    queryFn: () => {
      if (materialId === null) {
        // The hook disables itself without a material id; a direct caller of
        // the query options must not end up asking about "null".
        throw new Error("biblioCanLoanQuery cannot fetch without a material id")
      }
      return getBiblioCanLoan(config, materialId)
    },
  })

export const biblioReservationsQueryKey = () => ["serviceLayer", "biblioReservations"] as const

export const biblioReservationsQuery = (config: ServiceLayerConfig) =>
  queryOptions({
    queryKey: biblioReservationsQueryKey(),
    queryFn: () => getBiblioReservations(config),
  })

export const biblioLoanQuotasQueryKey = () => ["serviceLayer", "biblioLoanQuotas"] as const

export const biblioLoanQuotasQuery = (config: ServiceLayerConfig) =>
  queryOptions({
    queryKey: biblioLoanQuotasQueryKey(),
    queryFn: () => getBiblioLoanQuotas(config),
  })

export const biblioSupportIdQueryKey = () => ["serviceLayer", "biblioSupportId"] as const

export const biblioSupportIdQuery = (config: ServiceLayerConfig) =>
  queryOptions({
    queryKey: biblioSupportIdQueryKey(),
    queryFn: () => getBiblioSupportId(config),
  })
