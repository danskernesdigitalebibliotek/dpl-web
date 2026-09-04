import {
  isPublizonReservation,
  ReservationType
} from "./types/reservation-type";
import usePublizonReservationsClosed from "./usePublizonReservationsClosed";

/**
 * TEMPORARY: whether the patron may cancel a reservation they hold.
 *
 * The one rule behind every cancel button, so the material page, the
 * reservation list and the dashboard cannot disagree about it: only the queue
 * being copied stands still, so physical reservations and the ones Biblio
 * holds are unaffected. Refusing one always comes with
 * `digitalReservationCancelClosedInfoText`, so the patron is told why.
 *
 * Delete this file once the freeze is lifted, together with
 * `usePublizonReservationsClosed`.
 */
const useCanCancelReservation = () => {
  const publizonReservationsClosed = usePublizonReservationsClosed();

  return (reservation: ReservationType): boolean =>
    !(publizonReservationsClosed && isPublizonReservation(reservation));
};

export default useCanCancelReservation;
