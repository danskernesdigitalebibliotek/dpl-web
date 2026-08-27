"use client"

import {
  type QueryKey,
  type UseMutationOptions,
  type UseMutationResult,
  type UseQueryOptions,
  type UseQueryResult,
  useMutation,
  useQuery,
} from "@tanstack/react-query"

import {
  acceptDigitalOffer,
  createDigitalLoan,
  createDigitalReservation,
  deleteDigitalReservation,
} from "../biblio"
import { useServiceLayerConfig } from "../context/ServiceLayerContext"
import {
  digitalLoanDecisionQuery,
  type digitalLoanDecisionQueryKey,
  digitalLoanQuotasQuery,
  type digitalLoanQuotasQueryKey,
  digitalLoansQuery,
  type digitalLoansQueryKey,
  digitalMaterialQuery,
  type digitalMaterialQueryKey,
  digitalReservationsQuery,
  type digitalReservationsQueryKey,
  digitalSupportIdQuery,
  type digitalSupportIdQueryKey,
} from "../queries/biblio"
import type {
  DigitalLoan,
  DigitalLoanQuota,
  DigitalMaterial,
  DigitalReservation,
  LoanDecision,
  LoanRequestResult,
  ServiceLayerConfig,
} from "../types"

type DigitalQueryOptions<TData, TKey extends QueryKey> = Omit<
  UseQueryOptions<TData, Error, TData, TKey>,
  "queryKey" | "queryFn" | "enabled"
> & { enabled?: boolean }

// The shared shape of every query hook below: resolve the query from the
// config, let the consumer's options through, and own the `enabled` answer.
// Patron-scoped queries never fire without a patron session, regardless of
// the consumer's own `enabled` condition, and a query that `requires` an
// input it does not have stays off the wire.
const useDigitalQuery = <TData, TKey extends QueryKey>({
  query,
  options,
  patronScoped = true,
  requires = true,
}: {
  query: (config: ServiceLayerConfig) => UseQueryOptions<TData, Error, TData, TKey>
  options?: DigitalQueryOptions<TData, TKey>
  patronScoped?: boolean
  requires?: boolean
}): UseQueryResult<TData, Error> => {
  const config = useServiceLayerConfig()
  const { enabled = true, ...restOptions } = options ?? {}
  return useQuery({
    ...query(config),
    ...restOptions,
    enabled: (!patronScoped || (config.isPatronAuthenticated ?? true)) && enabled && requires,
  })
}

type DigitalLoansPage = { loans: DigitalLoan[]; nextCursor?: string }

export const useDigitalLoans = (
  options?: DigitalQueryOptions<DigitalLoansPage, ReturnType<typeof digitalLoansQueryKey>>
): UseQueryResult<DigitalLoansPage, Error> => useDigitalQuery({ query: digitalLoansQuery, options })

type DigitalReservationsPage = { reservations: DigitalReservation[]; nextCursor?: string }

export const useDigitalReservations = (
  options?: DigitalQueryOptions<
    DigitalReservationsPage,
    ReturnType<typeof digitalReservationsQueryKey>
  >
): UseQueryResult<DigitalReservationsPage, Error> =>
  useDigitalQuery({ query: digitalReservationsQuery, options })

export const useDigitalLoanQuotas = (
  options?: DigitalQueryOptions<DigitalLoanQuota[], ReturnType<typeof digitalLoanQuotasQueryKey>>
): UseQueryResult<DigitalLoanQuota[], Error> =>
  useDigitalQuery({ query: digitalLoanQuotasQuery, options })

export const useDigitalSupportId = (
  options?: DigitalQueryOptions<string, ReturnType<typeof digitalSupportIdQueryKey>>
): UseQueryResult<string, Error> => useDigitalQuery({ query: digitalSupportIdQuery, options })

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

/**
 * Whether the user can borrow a material through the Biblio adapter.
 *
 * Patron-scoped: the operation is canLoanForAuthenticatedUser, and the adapter
 * answers 403 for a library token - which, with errors surfaced, takes the
 * whole page down. The hook therefore refuses to ask without a patron, so a
 * call site cannot forget to guard.
 *
 * A material the adapter does not know resolves to null when the config
 * tolerates unknown materials - see ServiceLayerConfig - so call sites need
 * no per-call opt-in either.
 */
export const useDigitalLoanDecision = (
  materialId: string | null,
  options?: DigitalQueryOptions<LoanDecision | null, ReturnType<typeof digitalLoanDecisionQueryKey>>
): UseQueryResult<LoanDecision | null, Error> =>
  useDigitalQuery({
    query: config => digitalLoanDecisionQuery(config, materialId),
    options,
    requires: Boolean(materialId),
  })

type DigitalMutationOptions<TResult> = Omit<
  UseMutationOptions<TResult, Error, string>,
  "mutationFn"
>

// The shared shape of every mutation hook below: the adapter operations all
// take the config plus a single id, so the hooks only differ in which
// operation they bind.
const useDigitalMutation = <TResult>(
  mutate: (config: ServiceLayerConfig, id: string) => Promise<TResult>,
  options?: DigitalMutationOptions<TResult>
): UseMutationResult<TResult, Error, string> => {
  const config = useServiceLayerConfig()
  return useMutation({
    mutationFn: id => mutate(config, id),
    ...options,
  })
}

/**
 * Create a digital loan through the Biblio adapter.
 *
 * The adapter can accept the request without creating a loan - an exceeded
 * quota, say - so callers must check `result.loan` rather than treat a
 * resolved promise as success.
 *
 * Callers gate on the feature flag: new loans belong to Biblio only once the
 * library has switched to it.
 */
export const useDigitalCreateLoan = (
  options?: DigitalMutationOptions<LoanRequestResult>
): UseMutationResult<LoanRequestResult, Error, string> =>
  useDigitalMutation(createDigitalLoan, options)

/**
 * Reserve a material through the Biblio adapter.
 *
 * Answers with the same envelope as a loan request: a decision status, and a
 * loan when the material turned out to be available right away.
 */
export const useDigitalCreateReservation = (
  options?: DigitalMutationOptions<LoanRequestResult>
): UseMutationResult<LoanRequestResult, Error, string> =>
  useDigitalMutation(createDigitalReservation, options)

/**
 * Accept a reservation offer as a loan.
 *
 * Publizon has no explicit redeem step - a redeemable reservation simply shows
 * the loan button, and creating the loan redeems it. Biblio separates the two,
 * so a material the user already holds an offer for is accepted here rather
 * than borrowed through createLoan.
 */
export const useDigitalAcceptOffer = (
  options?: DigitalMutationOptions<{ success: boolean; loanId?: string }>
): UseMutationResult<{ success: boolean; loanId?: string }, Error, string> =>
  useDigitalMutation(acceptDigitalOffer, options)

/**
 * Cancel a reservation in the Biblio adapter, by the reservation's own id -
 * Publizon cancels by material identifier.
 *
 * A request the adapter accepted without removing anything rejects rather than
 * resolves; see deleteDigitalReservation for why.
 */
export const useDigitalDeleteReservation = (
  options?: DigitalMutationOptions<void>
): UseMutationResult<void, Error, string> => useDigitalMutation(deleteDigitalReservation, options)
