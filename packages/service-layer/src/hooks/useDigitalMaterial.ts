"use client"

import { type UseQueryOptions, type UseQueryResult, useQuery } from "@tanstack/react-query"

import { useServiceLayerConfig } from "../context/ServiceLayerContext"
import type { digitalMaterialQueryKey } from "../queries/biblio"
import { digitalMaterialQuery } from "../queries/biblio"
import type { DigitalMaterial } from "../types"

type DigitalMaterialQueryKey = ReturnType<typeof digitalMaterialQueryKey>

type UseDigitalMaterialOptions = Omit<
  UseQueryOptions<DigitalMaterial | null, Error, DigitalMaterial | null, DigitalMaterialQueryKey>,
  "queryKey" | "queryFn" | "enabled"
> & { enabled?: boolean }

/**
 * Catalogue fields for a material the adapter is known to provide. This is not
 * a way to find out who provides one - the item already says that.
 *
 * Metadata is not patron-scoped: the adapter accepts a library token, so this
 * answers for visitors too.
 */
export const useDigitalMaterial = (
  isbn: string | null,
  options?: UseDigitalMaterialOptions
): UseQueryResult<DigitalMaterial | null, Error> => {
  const config = useServiceLayerConfig()
  const { enabled = true, ...restOptions } = options ?? {}
  return useQuery({
    ...digitalMaterialQuery(config, isbn),
    ...restOptions,
    enabled: enabled && Boolean(isbn),
  })
}
