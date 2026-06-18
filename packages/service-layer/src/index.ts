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
} from "./types"

export { RESERVATION_FAILURE_REASONS } from "./types"

// React provider — wraps an app subtree and supplies config to the hooks.
export { ServiceLayerProvider } from "./context/ServiceLayerContext"

// React hooks — fetch + lifecycle. Require ServiceLayerProvider above in the tree.
export { usePatron } from "./hooks/usePatron"
export { useMaterialAvailability } from "./hooks/useMaterialAvailability"
export { useReservations } from "./hooks/useReservations"

// queryOptions factories — for prefetchQuery / setQueryData in non-hook contexts.
export { patronQuery } from "./queries/patron"
export { materialAvailabilityQuery } from "./queries/availability"
export { reservationsQuery } from "./queries/reservations"

// Query keys — for cache mutations (tests, stories, setQueryData).
export { patronQueryKey, materialAvailabilityQueryKey, reservationsQueryKey } from "./queryKeys"

// Imperative fetchers — for non-react-query contexts (e.g. baking patron name into session).
export { getPatron } from "./patron"
export { getMaterialAvailability } from "./availability"
export { createReservation } from "./reservation"
export { getReservations, deleteReservation } from "./reservations"
