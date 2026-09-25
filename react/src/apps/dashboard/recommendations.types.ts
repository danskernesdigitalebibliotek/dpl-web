import { WorkId } from "../../core/utils/types/ids";
import { RecommendationOrigin } from "./recommendationSeed";

/**
 * The work the recommendations are based on: a seed resolved to a work id
 * and a title. The origin is carried over from the seed so the heading can
 * be phrased after it.
 */
export type RecommendationSource = {
  origin: RecommendationOrigin;
  workId: WorkId;
  title: string | null;
};

// The display-ready shape the dashboard recommendations UI consumes. Flat on
// purpose - the rendering components never dig through the raw work structure.
export type RecommendedWork = {
  workId: WorkId;
  title: string;
  author: string;
  coverSrc: string | null;
};

/** Recommendations together with the source they were based on. */
export type RecommendationResult = {
  recommendations: RecommendedWork[];
  source: RecommendationSource;
};
