"use client"

import type { UseQueryResult } from "@tanstack/react-query"

import {
  digitalMaterialHoldingQuery,
  type digitalMaterialHoldingQueryKey,
} from "../queries/digital-loans"
import type { DigitalLoan } from "../types"
import { type DigitalQueryOptions, useDigitalQuery } from "./internal"

/**
 * The loan the patron already holds on this material, if any.
 *
 * What a material page asks when it has to decide between offering to borrow
 * and offering to read. `useDigitalLoans` answers the same question for a
 * whole list and describes every loan from the catalogue to do it; this one
 * needs no description, so it does not wait on that search.
 */
export const useDigitalMaterialHolding = (
  materialId: string | null,
  options?: DigitalQueryOptions<
    DigitalLoan | null,
    ReturnType<typeof digitalMaterialHoldingQueryKey>
  >
): UseQueryResult<DigitalLoan | null, Error> =>
  useDigitalQuery({
    query: config => digitalMaterialHoldingQuery(config, materialId),
    options,
    requires: Boolean(materialId),
  })
