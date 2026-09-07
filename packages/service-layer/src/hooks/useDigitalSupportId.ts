"use client"

import type { UseQueryResult } from "@tanstack/react-query"

import { digitalSupportIdQuery, type digitalSupportIdQueryKey } from "../queries/digital-support-id"
import { type DigitalQueryOptions, useDigitalQuery } from "./internal"

export const useDigitalSupportId = (
  options?: DigitalQueryOptions<string, ReturnType<typeof digitalSupportIdQueryKey>>
): UseQueryResult<string, Error> => useDigitalQuery({ query: digitalSupportIdQuery, options })
