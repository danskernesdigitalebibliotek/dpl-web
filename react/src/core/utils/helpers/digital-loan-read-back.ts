import { QueryClient, QueryKey } from "@tanstack/react-query";
import {
  digitalLoanDecisionQueryKey,
  digitalLoansQueryKey,
  digitalReservationsQueryKey
} from "@danskernesdigitalebibliotek/dpl-service-layer";

/**
 * How long a loan or reservation waits for the lists it changed to answer
 * before the user is told it went through anyway. A refetch that keeps
 * failing retries with backoff, and one whose connection drops after it went
 * out stays unresolved until the device is back - neither may hold a receipt
 * hostage for something the server has already done.
 */
export const readBackGraceMs = 3000;

/**
 * Refetch the given lists and resolve once they have landed, or once the
 * grace period is up, whichever comes first.
 *
 * Callers await this from a mutation's onSuccess, which is what keeps the
 * mutation pending until the read-back is in: the receipt hands the user the
 * same buttons the material page has, and read off lists that have not caught
 * up they offer the loan that was just made. `refetchType: "all"` so the
 * promise means "the answer is in" even for a list nothing is showing at the
 * time.
 */
export const awaitReadBack = (
  queryClient: QueryClient,
  queryKeys: QueryKey[]
) => {
  let graceTimer: ReturnType<typeof setTimeout>;
  return Promise.race([
    Promise.all(
      queryKeys.map((queryKey) =>
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
