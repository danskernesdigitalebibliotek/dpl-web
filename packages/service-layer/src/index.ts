// Domain types — what apps reason about.
export type {
  ApiId,
  Patron,
  MaterialAvailability,
  ServiceLayerConfig,
  CreateReservationInput,
  CreateReservationResult,
  CreateReservationSuccess,
  CreateReservationFailed,
  FailureReason,
  Reservation,
  Fee,
  Loan,
  RenewedLoan,
  RenewedLoanSuccess,
  RenewedLoanFailed,
  RenewalFailureReason,
} from "./types"

export { RESERVATION_FAILURE_REASONS, RENEWAL_FAILURE_REASONS } from "./types"

// React provider — wraps an app subtree and supplies config to the hooks.
export { ServiceLayerProvider, useServiceLayerConfig } from "./context/ServiceLayerContext"

// React hooks — fetch + lifecycle. Require ServiceLayerProvider above in the tree.
export { usePatron } from "./hooks/usePatron"
export { useMaterialAvailability } from "./hooks/useMaterialAvailability"
export { useReservations } from "./hooks/useReservations"
export { useCreateReservation } from "./hooks/useCreateReservation"
export { useDeleteReservation } from "./hooks/useDeleteReservation"
export { useLoans } from "./hooks/useLoans"
export { useFees } from "./hooks/useFees"
export { useRenewLoans } from "./hooks/useRenewLoans"

// queryOptions factories — for prefetchQuery / setQueryData in non-hook contexts.
export { patronQuery } from "./queries/patron"
export { materialAvailabilityQuery } from "./queries/availability"
export { reservationsQuery } from "./queries/reservations"
export { loansQuery } from "./queries/loans"
export { feesQuery } from "./queries/fees"

// Query keys — for cache mutations (tests, stories, setQueryData).
export { patronQueryKey } from "./queries/patron"
export { materialAvailabilityQueryKey } from "./queries/availability"
export { reservationsQueryKey } from "./queries/reservations"
export { loansQueryKey } from "./queries/loans"
export { feesQueryKey } from "./queries/fees"

// Imperative fetchers — for non-react-query contexts (e.g. baking patron name into session).
export { getPatron } from "./patron"
export { getMaterialAvailability } from "./availability"
export { createReservation } from "./reservation"
export { getReservations, deleteReservation } from "./reservations"
export { getLoans, renewLoans } from "./loans"
export { getFees } from "./fees"

// Biblio adapter — the digital-materials provider behind the CMS feature flag.
// The public surface is what the apps actually consume: the hooks, the
// predicates that read their answers, the query keys they invalidate, and
// the one query the reader consumes directly. The raw functions and query
// builders behind them stay internal until something server-side needs them
// - a smaller surface is less to keep stable.
export {
  getDigitalLoanQuota,
  isCostFreeLoan,
  isMaterialAvailable,
  isMaterialLoanable,
  isMaterialReservable,
  isRequestGranted,
} from "./biblio"
export {
  digitalLoanDecisionQueryKey,
  digitalLoanQuotasQueryKey,
  digitalLoansQueryKey,
  digitalReservationsQueryKey,
  readerSignInTokenQuery,
} from "./queries/biblio"
export {
  useDigitalAcceptOffer,
  useDigitalCreateLoan,
  useDigitalCreateReservation,
  useDigitalDeleteReservation,
  useDigitalLoanDecision,
  useDigitalLoanQuotas,
  useDigitalLoans,
  useDigitalMaterial,
  useDigitalReservations,
  useDigitalSupportId,
} from "./hooks/biblio"
export type { QuotaUsage } from "./biblio"
export type {
  DigitalMaterial,
  DigitalMaterialType,
  MaterialType,
  LoanProvider,
  DigitalLoan,
  DigitalReservation,
  LoanDecision,
  LoanDecisionStatus,
  LoanRequestResult,
  DigitalLoanQuota,
  ReaderSignInToken,
} from "./types"
