import { useEventStatistics } from "./useStatistics";
import { statistics } from "./statistics";
import { WorkId } from "../utils/types/ids";

/**
 * Counting a loan or a reservation that went through. Both lending providers
 * count the same two events, so the work being counted is bound once here
 * rather than repeated at every call site.
 */
const useLoanReservationTracking = (workId: WorkId) => {
  const { track } = useEventStatistics();

  const trackLoan = () =>
    track("click", {
      id: statistics.publizonLoan.id,
      name: statistics.publizonLoan.name,
      trackedData: workId
    });

  const trackReservation = () =>
    track("click", {
      id: statistics.publizonReserve.id,
      name: statistics.publizonReserve.name,
      trackedData: workId
    });

  return { trackLoan, trackReservation };
};

export default useLoanReservationTracking;
