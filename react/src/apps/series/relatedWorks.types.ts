import { Pid, WorkId } from "../../core/utils/types/ids";

// One series membership of a work, as the FBI API reports it when a series is
// reached through a work: numberInSeries/readThisFirst describe THIS work's
// place in that series.
export type RelatedWorkSeries = {
  seriesId: string | null;
  title: string;
  numberInSeries: string | null;
  readThisFirst: boolean | null;
};

// The display-ready shape the related-works UI consumes. Deliberately flat -
// the components rendering this should never need to dig through the raw
// work/manifestation structure.
export type RelatedWork = {
  workId: WorkId;
  title: string;
  creators: string[];
  year: number | null;
  series: RelatedWorkSeries[];
  coverPid: Pid;
  // Resolved cover image url, batch-fetched for the picked works only -
  // null when FBI has no cover in the wanted size (the cover component
  // falls back to a tinted placeholder).
  coverSrc?: string | null;
};
