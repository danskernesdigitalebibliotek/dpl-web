import {
  useGetV1LoanstatusIdentifier,
  useGetV1UserLoans,
  useGetV1UserReservations
} from "../publizon/publizon";
import {
  getOrderIdByIdentifier,
  findReservedReservation
} from "../../components/reader-player/helper";
import { getLoanStatus } from "../../components/availability-label/types";
import {
  mapPublizonLoanToLoanType,
  mapPublizonReservationToReservationType
} from "./helpers/list-mapper";
import { isAnonymous } from "./helpers/user";
import {
  ReaderPlayerState,
  unknownReaderPlayerState
} from "./types/reader-player-state";

/**
 * What Publizon says about a digital material.
 *
 * This is the Publizon half of the transition and is meant to be deleted with
 * the rest of the Publizon integration - see `ReaderPlayerState`.
 *
 * ## Why acquiring is gated separately from holding
 *
 * A library that has switched to the adapter keeps its old Publizon loans, and
 * those must stay readable: the loan was made there, the reader opens it from
 * there. But Publizon may no longer decide whether a NEW loan is possible -
 * that is the whole point of switching. `canAcquire` separates the two, so
 * holdings are always read while the loan decision is only asked for when
 * Publizon is still the lending provider.
 */
const usePublizonReaderPlayerState = ({
  identifier,
  canAcquire
}: {
  identifier: string | null;
  /** Whether Publizon may decide that a new loan or reservation is possible. */
  canAcquire: boolean;
}): ReaderPlayerState => {
  const isUserAnonymous = isAnonymous();
  const hasIdentifier = Boolean(identifier);
  // An anonymous user has no holdings to look up, and the endpoints need a
  // user token anyway.
  const canReadHoldings = hasIdentifier && !isUserAnonymous;

  const { data: loansPublizon, isLoading: isLoadingLoans } = useGetV1UserLoans(
    {},
    { query: { enabled: canReadHoldings } }
  );

  const { data: reservationsPublizon, isLoading: isLoadingReservations } =
    useGetV1UserReservations({ query: { enabled: canReadHoldings } });

  // Safe to use identifier! because the query is disabled without one.
  const { data: dataLoanStatus, isLoading: isLoadingLoanStatus } =
    useGetV1LoanstatusIdentifier(identifier!, {
      query: { enabled: hasIdentifier && canAcquire }
    });

  if (!hasIdentifier) {
    return unknownReaderPlayerState;
  }

  const loans = loansPublizon?.loans
    ? mapPublizonLoanToLoanType(loansPublizon.loans)
    : null;
  const reservations = reservationsPublizon?.reservations
    ? mapPublizonReservationToReservationType(reservationsPublizon.reservations)
    : null;

  // The order id IS the loan as far as the reader is concerned: it is what
  // opens it, and every caller checks it alongside isAlreadyLoaned.
  const orderId =
    (loans && identifier
      ? getOrderIdByIdentifier({ loans, identifier })
      : null) ?? null;

  const reservation =
    (identifier && reservations
      ? findReservedReservation(identifier, reservations)
      : null) ?? null;

  const { redeemable, loanable, reservable } = getLoanStatus(dataLoanStatus);

  return {
    isAlreadyLoaned: Boolean(orderId),
    isAlreadyReserved: Boolean(reservation),
    // An anonymous user is offered the loan so the login guard can take over.
    canBeLoaned: canAcquire && (isUserAnonymous || redeemable || loanable),
    canBeReserved: canAcquire && reservable,
    orderId,
    reservation,
    // Publizon has no offer to accept - redeeming is folded into canBeLoaned.
    offerId: null,
    // Publizon serves samples for its whole catalogue, so the offer is not
    // conditional on anything the API answers.
    canBeSampled: true,
    // Disabled queries never report loading, so this only counts the
    // questions actually asked.
    isLoading: isLoadingLoanStatus || isLoadingLoans || isLoadingReservations
  };
};

export default usePublizonReaderPlayerState;
