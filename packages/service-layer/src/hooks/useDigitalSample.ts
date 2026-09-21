"use client"

import type { UseQueryResult } from "@tanstack/react-query"

import { digitalSampleQuery, type digitalSampleQueryKey } from "../queries/digital-sample"
import type { DigitalSample } from "../types"
import { type DigitalQueryOptions, useDigitalQuery } from "./internal"

/**
 * The excerpt a material can be tried through, or null when it has none.
 *
 * Not patron-scoped, and that is the point: the adapter answers samples for a
 * library token, so this is the one acquiring question a visitor who is not
 * signed in can have answered. The WeDoBooks SDK opens the returned url
 * without a session of its own.
 *
 * The url is signed and short-lived, and its signature changes on every call,
 * so the answer is kept for the life of the page rather than re-minted - see
 * digitalSampleQuery.
 */
export const useDigitalSample = (
  materialId: string | null,
  options?: DigitalQueryOptions<DigitalSample | null, ReturnType<typeof digitalSampleQueryKey>>
): UseQueryResult<DigitalSample | null, Error> =>
  useDigitalQuery({
    query: config => digitalSampleQuery(config, materialId),
    options,
    patronScoped: false,
    requires: Boolean(materialId),
  })
