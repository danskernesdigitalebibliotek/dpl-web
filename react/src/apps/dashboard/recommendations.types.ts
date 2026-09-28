import { WorkId } from "../../core/utils/types/ids";

/** Which of the patron's lists a recommendation seed was taken from. */
export type RecommendationOrigin = "loan" | "reservation" | "favorite";

// The display-ready shape the dashboard recommendations UI consumes. Flat on
// purpose - the rendering components never dig through the raw work structure.
export type RecommendedWork = {
  workId: WorkId;
  title: string;
  author: string;
  coverSrc: string | null;
};
