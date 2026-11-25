import { useGetDashboardRecommendationsQuery } from "../../core/dbc-gateway/generated/graphql";
import { useUrls } from "../../core/utils/url";
import { recommendationQueryOptions } from "./recommendationQueryOptions";
import { RecommendationSeed } from "./recommendationSeed";
import { RecommendationResult, RecommendedWork } from "./recommendations.types";
import useRecommendationSource from "./useRecommendationSource";
import { toRecommendedWork } from "./toRecommendedWork";

export type UseRecommendationsResult =
  | { status: "loading" }
  | { status: "miss" }
  | { status: "found"; result: RecommendationResult };

const FETCH_LIMIT = 16;

/**
 * Fetches recommendations for a seed. The seed is first resolved to the work
 * it identifies, and that work is what the recommender is asked about. A hit
 * carries the resolved source along with the recommendations. The seed misses
 * when it does not resolve to a titled work, a request fails, or the
 * recommender has nothing for it.
 */
const useRecommendations = (
  seed: RecommendationSeed
): UseRecommendationsResult => {
  const { source, isLoading: isLoadingSource } = useRecommendationSource(seed);
  const materialUrl = useUrls()("materialUrl");

  const { data, isLoading: isLoadingRecommendations } =
    useGetDashboardRecommendationsQuery(
      { id: source?.workId ?? "", limit: FETCH_LIMIT },
      { ...recommendationQueryOptions, enabled: source !== null }
    );

  const recommendations: RecommendedWork[] | null =
    data?.recommend.result.map(({ work }) =>
      toRecommendedWork(work, materialUrl)
    ) ?? null;

  if (isLoadingSource || isLoadingRecommendations) {
    return { status: "loading" };
  }

  if (!source || !recommendations || recommendations.length === 0) {
    return { status: "miss" };
  }

  return { status: "found", result: { recommendations, source } };
};

export default useRecommendations;
