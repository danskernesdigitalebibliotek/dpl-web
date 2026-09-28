import { UseTextFunction } from "../../core/utils/text";
import {
  RecommendationOrigin,
  RecommendationSource
} from "./recommendations.types";

const headingTextKeyByOrigin: Record<RecommendationOrigin, string> = {
  loan: "dashboardRecommendationsLoanHeadingText",
  reservation: "dashboardRecommendationsReservationHeadingText",
  favorite: "dashboardRecommendationsFavoriteHeadingText"
};

/**
 * The heading names the material the recommendations are based on, phrased
 * after where it came from.
 */
export const getRecommendationsHeading = (
  source: RecommendationSource,
  t: UseTextFunction
): string =>
  t(headingTextKeyByOrigin[source.origin], {
    placeholders: { "@title": source.title }
  });
