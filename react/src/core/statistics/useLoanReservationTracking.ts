import { useEventStatistics } from "./useStatistics";
import { statistics } from "./statistics";
import { WorkId } from "../utils/types/ids";

/** Tracks a completed loan or reservation; shared by both providers. */
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
