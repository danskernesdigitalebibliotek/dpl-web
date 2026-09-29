import { WorkId } from "../../core/utils/types/ids";

// The display-ready shape the dashboard recommendations UI consumes. Flat on
// purpose - the rendering components never dig through the raw work structure.
export type RecommendedWork = {
  workId: WorkId;
  title: string;
  author: string;
  coverSrc: string | null;
};
