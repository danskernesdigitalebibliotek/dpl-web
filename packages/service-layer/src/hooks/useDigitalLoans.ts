"use client"

import type { UseQueryResult } from "@tanstack/react-query"

import { digitalLoansQuery, type digitalLoansQueryKey } from "../queries/biblio"
import type { DigitalLoan } from "../types"
import { type DigitalQueryOptions, useDigitalQuery } from "./internal"

type DigitalLoansPage = { loans: DigitalLoan[]; nextCursor?: string }

export const useDigitalLoans = (
  options?: DigitalQueryOptions<DigitalLoansPage, ReturnType<typeof digitalLoansQueryKey>>
): UseQueryResult<DigitalLoansPage, Error> => useDigitalQuery({ query: digitalLoansQuery, options })
