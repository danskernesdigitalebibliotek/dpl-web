import {
  isMaterialLoanable,
  isMaterialReservable,
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
 * What the service layer says about a digital material.
 *
 * The service layer half of the transition - see `ReaderPlayerState` for how
 * it is
 * kept interchangeable with the Publizon half. Callers gate on the provider
 * probe through `enabled`; this hook only asks the adapter about materials it
 * actually provides.
 *
 * ## Where the service layer differs from Publizon
 *
 * Publizon answers everything from one loan status per material, including
 * whether the user already holds it. The service layer splits that across three
 * endpoints, which is an improvement: the loan the user holds is the same
 * record that gives us the key to open it in the reader, rather than a status
 * code that happens to say "loaned".
 *
 * An offered reservation is the other difference. Publizon has no redeem step
 * - a redeemable reservation simply shows the loan button - so an offer is
 * reported here as `canBeLoaned` too. What that takes is then decided in
 * useOnlineInternalHandleLoanReservation, which accepts the offer instead of
 * creating a second loan.
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

  // A tolerated unknown material resolves to null - see ServiceLayerConfig's
  // TEMPORARY toleration setting - and null offers nothing: exactly what a
  // material the provider cannot lend should get.
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
    // The service layer's loan id plays the same role as Publizon's order id.
    orderId: loan?.loanId ?? null,
    // Mapped rather than passed through so cancelling routes correctly: the
    // mapping is what carries the adapter's own reservation id.
    reservation: queuedReservation
      ? mapDigitalReservationToReservationType([queuedReservation])[0]
      : null,
    offerId,
    // A tolerated 404 (null) means the adapter does not know the material at
    // all - then it has no sample either, and offering one would open an
    // empty reader or player.
    canBeSampled: loanDecision !== null,
    // Disabled queries never report loading, so this only counts the
    // questions actually asked.
    isLoading: isLoadingLoanDecision || isLoadingLoans || isLoadingReservations
  };
};

export default useDigitalReaderPlayerState;
