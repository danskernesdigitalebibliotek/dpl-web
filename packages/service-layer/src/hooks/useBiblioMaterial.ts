"use client"

import { type UseQueryOptions, type UseQueryResult, useQuery } from "@tanstack/react-query"

import { useServiceLayerConfig } from "../context/ServiceLayerContext"
import type { biblioMaterialQueryKey } from "../queries/biblio"
import { biblioMaterialQuery } from "../queries/biblio"
import type { BiblioMaterial } from "../types"

type BiblioMaterialQueryKey = ReturnType<typeof biblioMaterialQueryKey>

type UseBiblioMaterialOptions = Omit<
  UseQueryOptions<BiblioMaterial | null, Error, BiblioMaterial | null, BiblioMaterialQueryKey>,
  "queryKey" | "queryFn" | "enabled"
> & { enabled?: boolean }

/**
 * Catalogue fields for a material the adapter is known to provide. This is not
 * a way to find out who provides one - the item already says that.
 *
 * Metadata is not patron-scoped: the adapter accepts a library token, so this
 * answers for visitors too.
 */
export const useBiblioMaterial = (
  isbn: string | null,
  options?: UseBiblioMaterialOptions
): UseQueryResult<BiblioMaterial | null, Error> => {
  const config = useServiceLayerConfig()
  const { enabled = true, ...restOptions } = options ?? {}
  return useQuery({
    ...biblioMaterialQuery(config, isbn),
    ...restOptions,
    enabled: enabled && Boolean(isbn),
  })
}
