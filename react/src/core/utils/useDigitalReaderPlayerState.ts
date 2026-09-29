import {
  isMaterialLoanable,
  isMaterialReservable,
  useDigitalLoanDecision,
  useDigitalMaterialHolding,
  useDigitalReservations,
  useDigitalSample
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
  // Borrowing, holding and queuing are all user-scoped and need an end-user
  // token, so an anonymous user is offered the loan and the login guard takes
  // over - the same deal Publizon gets. Sampling is the exception below.
  const isActiveForUser = isActive && !isUserAnonymous;

  const { data: loanDecision, isLoading: isLoadingLoanDecision } =
    useDigitalLoanDecision(identifier, {
      enabled: isActiveForUser
    });

  // The loan is asked for by material rather than filtered out of the loan
  // list: only its existence and its id are used here, and the list waits on
  // the catalogue to describe every loan in it.
  const { data: loan, isLoading: isLoadingLoan } = useDigitalMaterialHolding(
    identifier,
    { enabled: isActiveForUser }
  );

  const { data: reservationsData, isLoading: isLoadingReservations } =
    useDigitalReservations({ enabled: isActiveForUser });

  // Gated on `isActive` rather than on a patron: the adapter answers samples
  // for a library token, so this is the one question a visitor gets an answer
  // to. Asking it here is also what makes the teaser honest - a material with
  // no excerpt is never offered one.
  const { data: sample } = useDigitalSample(identifier, { enabled: isActive });

  if (!isActive) {
    return unknownReaderPlayerState;
  }

  if (isUserAnonymous) {
    return {
      ...unknownReaderPlayerState,
      canBeLoaned: true,
      canBeSampled: Boolean(sample)
    };
  }

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
    // TEMPORARY: only the Publizon queue is frozen - see
    // usePublizonReservationsClosed.
    publizonReservationsClosed: false,
    // The service layer's loan id plays the same role as Publizon's order id.
    orderId: loan?.loanId ?? null,
    // Mapped rather than passed through so cancelling routes correctly: the
    // mapping is what carries the adapter's own reservation id.
    reservation: queuedReservation
      ? mapDigitalReservationToReservationType([queuedReservation])[0]
      : null,
    offerId,
    // The excerpt itself answers this, not the lending decision: a material
    // that is on loan to someone else still has one, and a material the
    // provider knows may have none.
    canBeSampled: Boolean(sample),
    // Deliberately not counting the excerpt lookup: `isLoading` holds back
    // the loan and reserve buttons, and a secondary teaser must not delay
    // the primary action. The teaser simply stays hidden until its own
    // answer arrives, which is what `canBeSampled` being false already does.
    //
    // Disabled queries never report loading, so this only counts the
    // questions actually asked.
    isLoading: isLoadingLoanDecision || isLoadingLoan || isLoadingReservations
  };
};

export default useDigitalReaderPlayerState;
