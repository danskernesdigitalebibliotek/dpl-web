"use client"

import type { UseQueryResult } from "@tanstack/react-query"

import { digitalMaterialQuery, type digitalMaterialQueryKey } from "../queries/biblio"
import type { DigitalMaterial } from "../types"
import { type DigitalQueryOptions, useDigitalQuery } from "./internal"

/**
 * Catalogue fields for a material the adapter is known to provide. This is not
 * a way to find out who provides one - the item already says that.
 *
 * Metadata is not patron-scoped: the adapter accepts a library token, so this
 * answers for visitors too.
 */
export const useDigitalMaterial = (
  isbn: string | null,
  options?: DigitalQueryOptions<DigitalMaterial | null, ReturnType<typeof digitalMaterialQueryKey>>
): UseQueryResult<DigitalMaterial | null, Error> =>
  useDigitalQuery({
    query: config => digitalMaterialQuery(config, isbn),
    options,
    patronScoped: false,
    requires: Boolean(isbn),
  })
