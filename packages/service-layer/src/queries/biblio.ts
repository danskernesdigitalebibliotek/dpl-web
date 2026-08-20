import { queryOptions } from "@tanstack/react-query"

import { getBiblioLoans, getBiblioMaterial } from "../biblio"
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
