import { QueryClient, QueryKey } from "@tanstack/react-query";
import {
  digitalLoanDecisionQueryKey,
  digitalLoansQueryKey,
  digitalReservationsQueryKey
} from "@danskernesdigitalebibliotek/dpl-service-layer";

/**
 * Upper bound on the read-back. A failing refetch retries with backoff and an
 * offline one waits for the device to reconnect - neither may hold back the
 * receipt for a request the server already carried out.
 */
export const readBackGraceMs = 3000;

/**
 * Refetch the lists and resolve when they land or the grace period ends.
 * Returned from a mutation's onSuccess, which keeps it pending until then: the
 * receipt shows the material page's buttons, and stale lists would offer the
 * loan just made.
 */
export const awaitReadBack = (
  queryClient: QueryClient,
  queryKeys: QueryKey[]
) => {
  let graceTimer: ReturnType<typeof setTimeout>;
  return Promise.race([
    Promise.all(
      queryKeys.map((queryKey) =>
        // "all", or a list not on screen is only marked stale and the promise
        // resolves before its answer is in.
        queryClient.invalidateQueries({ queryKey, refetchType: "all" })
      )
    ),
    new Promise((resolve) => {
      graceTimer = setTimeout(resolve, readBackGraceMs);
    })
  ]).finally(() => clearTimeout(graceTimer));
};

/** Everything the adapter's answer for this material was derived from. */
export const digitalReadBackKeys = (materialId: string | null): QueryKey[] => [
  digitalLoansQueryKey(),
  digitalReservationsQueryKey(),
  digitalLoanDecisionQueryKey(materialId)
];
