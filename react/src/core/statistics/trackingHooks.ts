import { useEventStatistics } from "./useStatistics";
import { statistics } from "./statistics";

// Semantic wrappers over `useEventStatistics` that pre-fill the WTK
// id/name pair for a specific tracked event. Callers only need to supply
// the dynamic `trackedData` payload.

export const useTrackPublizonReadListen = () => {
  const { track } = useEventStatistics();
  return (trackedData: string) =>
    track("click", {
      id: statistics.publizonReadListen.id,
      name: statistics.publizonReadListen.name,
      trackedData
    });
};
