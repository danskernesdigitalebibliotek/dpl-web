import {
  isMaterialLoanable,
  isMaterialReservable,
  isUnknownMaterial,
  useDigitalLoanDecision,
  useDigitalLoans,
  useDigitalReservations
} from "@danskernesdigitalebibliotek/dpl-service-layer";
import { mapDigitalReservationToReservationType } from "./helpers/list-mapper";
import { isAnonymous } from "./helpers/user";
import {
  ReaderPlayerState,
  unknownReaderPlayerState
} from "./types/reader-player-state";

/**
 * What the service layer says about a digital material - the service layer
 * half of the transition, see `ReaderPlayerState`. Callers gate through
 * `enabled` so the adapter is only asked about materials it provides.
 *
 * Publizon has no redeem step, so an offered reservation is reported as
 * `canBeLoaned` too; useOnlineInternalHandleLoanReservation then accepts the
 * offer instead of creating a second loan.
 */
const useDigitalReaderPlayerState = ({
  identifier,
  enabled
}: {
  identifier: string | null;
  enabled: boolean;
}): ReaderPlayerState => {
  const isUserAnonymous = isAnonymous();
  const isActive = enabled && Boolean(identifier);
  // Every endpoint below is user-scoped and needs an end-user token, so an
  // anonymous user is offered the loan and the login guard takes over - the
  // same deal Publizon gets.
  const isActiveForUser = isActive && !isUserAnonymous;

  const { data: loanDecision, isLoading: isLoadingLoanDecision } =
    useDigitalLoanDecision(identifier, {
      enabled: isActiveForUser
    });

  const { data: loansData, isLoading: isLoadingLoans } = useDigitalLoans({
    enabled: isActiveForUser
  });

  const { data: reservationsData, isLoading: isLoadingReservations } =
    useDigitalReservations({ enabled: isActiveForUser });

  if (!isActive) {
    return unknownReaderPlayerState;
  }

  if (isUserAnonymous) {
    return {
      ...unknownReaderPlayerState,
      canBeLoaned: true
    };
  }

  const loan = loansData?.loans.find(
    ({ materialId }) => materialId === identifier
  );

  const digitalReservation = reservationsData?.reservations.find(
    ({ materialId }) => materialId === identifier
  );

  // An offer is waiting to be accepted as a loan; without one the user is
  // still queued and can only cancel.
  const offerId = digitalReservation?.offerId ?? null;
  const queuedReservation =
    digitalReservation && !offerId ? digitalReservation : undefined;

  const status = loanDecision?.status;

  return {
    isAlreadyLoaned: Boolean(loan),
    isAlreadyReserved: Boolean(queuedReservation),
    // An offer the user already holds is claimed through the same button.
    canBeLoaned:
      Boolean(offerId) || (status ? isMaterialLoanable(status) : false),
    canBeReserved: status ? isMaterialReservable(status) : false,
    // Only the Publizon queue is frozen - see usePublizonReservationsClosed.
    reservationsClosed: false,
    // The service layer's loan id plays the same role as Publizon's order id.
    orderId: loan?.loanId ?? null,
    // Mapped rather than passed through so cancelling routes correctly: the
    // mapping is what carries the adapter's own reservation id.
    reservation: queuedReservation
      ? mapDigitalReservationToReservationType([queuedReservation])[0]
      : null,
    offerId,
    canBeSampled: !isUnknownMaterial(loanDecision),
    // Disabled queries never report loading, so this only counts the
    // questions actually asked.
    isLoading: isLoadingLoanDecision || isLoadingLoans || isLoadingReservations
  };
};

export default useDigitalReaderPlayerState;
