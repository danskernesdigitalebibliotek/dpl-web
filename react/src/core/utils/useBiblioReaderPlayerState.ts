import {
  isMaterialLoanable,
  isMaterialReservable,
  useLoanDecision,
  useDigitalLoans,
  useDigitalReservations
} from "@danskernesdigitalebibliotek/dpl-service-layer";
import {
  mapBiblioLoanToLoanType,
  mapBiblioReservationToReservationType
} from "./helpers/list-mapper";
import { isAnonymous } from "./helpers/user";
import useBiblioTolerateUnknownMaterials from "../biblio/useBiblioTolerateUnknownMaterials";
import {
  ReaderPlayerState,
  unknownReaderPlayerState
} from "./types/reader-player-state";

/**
 * What the Biblio adapter says about a digital material.
 *
 * The Biblio half of the transition - see `ReaderPlayerState` for how it is
 * kept interchangeable with the Publizon half. Callers gate on the provider
 * probe through `enabled`; this hook only asks the adapter about materials it
 * actually provides.
 *
 * ## Where Biblio differs from Publizon
 *
 * Publizon answers everything from one loan status per material, including
 * whether the user already holds it. Biblio splits that across three
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
const useBiblioReaderPlayerState = ({
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

  // TEMPORARY allowNotFound, see useBiblioTolerateUnknownMaterials. A
  // tolerated unknown material resolves to null, and null offers nothing -
  // exactly what a material the provider cannot lend should get.
  const tolerateUnknown = useBiblioTolerateUnknownMaterials();
  const { data: canLoan, isLoading: isLoadingCanLoan } = useLoanDecision(
    identifier,
    { enabled: isActiveForUser, allowNotFound: tolerateUnknown }
  );

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
      canBeLoaned: true,
      isLoading: false
    };
  }

  const loan = loansData?.loans.find(
    ({ materialId }) => materialId === identifier
  );

  const biblioReservation = reservationsData?.reservations.find(
    ({ materialId }) => materialId === identifier
  );

  // An offer is waiting to be accepted as a loan; without one the user is
  // still queued and can only cancel.
  const offerId = biblioReservation?.offerId ?? null;
  const queuedReservation =
    biblioReservation && !offerId ? biblioReservation : undefined;

  const status = canLoan?.status;

  return {
    isAlreadyLoaned: Boolean(loan),
    isAlreadyReserved: Boolean(queuedReservation),
    // An offer the user already holds is claimed through the same button.
    canBeLoaned:
      Boolean(offerId) || (status ? isMaterialLoanable(status) : false),
    canBeReserved: status ? isMaterialReservable(status) : false,
    // The Biblio loan id plays the same role as Publizon's order id.
    orderId: loan ? (mapBiblioLoanToLoanType([loan])[0].orderId ?? null) : null,
    // Mapped rather than passed through so cancelling routes to Biblio: the
    // mapping is what carries the adapter's own reservation id.
    reservation: queuedReservation
      ? mapBiblioReservationToReservationType([queuedReservation])[0]
      : null,
    offerId,
    isLoading: isLoadingCanLoan || isLoadingLoans || isLoadingReservations
  };
};

export default useBiblioReaderPlayerState;
