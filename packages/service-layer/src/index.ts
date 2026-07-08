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
  Loan,
  RenewedLoan,
} from "./types"

export { RESERVATION_FAILURE_REASONS } from "./types"

// React provider — wraps an app subtree and supplies config to the hooks.
export { ServiceLayerProvider } from "./context/ServiceLayerContext"

// React hooks — fetch + lifecycle. Require ServiceLayerProvider above in the tree.
export { usePatron } from "./hooks/usePatron"
export { useMaterialAvailability } from "./hooks/useMaterialAvailability"
export { useReservations } from "./hooks/useReservations"
export { useCreateReservation } from "./hooks/useCreateReservation"
export { useDeleteReservation } from "./hooks/useDeleteReservation"
export { useLoans } from "./hooks/useLoans"
export { useRenewLoans } from "./hooks/useRenewLoans"

// queryOptions factories — for prefetchQuery / setQueryData in non-hook contexts.
export { patronQuery } from "./queries/patron"
export { materialAvailabilityQuery } from "./queries/availability"
export { reservationsQuery } from "./queries/reservations"
export { loansQuery } from "./queries/loans"

// Query keys — for cache mutations (tests, stories, setQueryData).
export { patronQueryKey } from "./queries/patron"
export { materialAvailabilityQueryKey } from "./queries/availability"
export { reservationsQueryKey } from "./queries/reservations"
export { loansQueryKey } from "./queries/loans"

// Imperative fetchers — for non-react-query contexts (e.g. baking patron name into session).
export { getPatron } from "./patron"
export { getMaterialAvailability } from "./availability"
export { createReservation } from "./reservation"
export { getReservations, deleteReservation } from "./reservations"
export { getLoans, renewLoans } from "./loans"
