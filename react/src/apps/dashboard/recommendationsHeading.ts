import { UseTextFunction } from "../../core/utils/text";
import { RecommendationOrigin } from "./recommendationSeed";
import { RecommendationSource } from "./recommendations.types";

const headingTextKeyByOrigin: Record<RecommendationOrigin, string> = {
  loan: "dashboardRecommendationsLoanHeadingText",
  reservation: "dashboardRecommendationsReservationHeadingText",
  favorite: "dashboardRecommendationsFavoriteHeadingText"
};

/**
 * The heading names the material the recommendations are based on, phrased
 * after where it came from. Without a source title the generic heading is used.
 */
export const getRecommendationsHeading = (
  source: RecommendationSource,
  t: UseTextFunction
): string => {
  if (!source.title) {
    return t("dashboardRecommendationsHeadingText");
  }

  return t(headingTextKeyByOrigin[source.origin], {
    placeholders: { "@title": source.title }
  });
};
