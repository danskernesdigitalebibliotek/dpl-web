import { useEventStatistics } from "./useStatistics";
import { statistics } from "./statistics";

type Track = ReturnType<typeof useEventStatistics>["track"];

export const trackPublizonReadListen = (track: Track, trackedData: string) =>
  track("click", {
    id: statistics.publizonReadListen.id,
    name: statistics.publizonReadListen.name,
    trackedData
  });
