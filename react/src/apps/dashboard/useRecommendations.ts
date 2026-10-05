import { useGetDashboardRecommendationsQuery } from "../../core/dbc-gateway/generated/graphql";
import { WorkId } from "../../core/utils/types/ids";
import { RecommendationSeed } from "./recommendationSeed";
import { RecommendationResult, RecommendedWork } from "./recommendations.types";
import useRecommendationSource from "./useRecommendationSource";

export type UseRecommendationsResult = {
  result: RecommendationResult | null;
  isLoading: boolean;
};

const FETCH_LIMIT = 16;

/**
 * Fetches recommendations for a seed. The seed is first resolved to the work
 * it identifies, and that work is what the recommender is asked about. The
 * result carries the resolved source along with the recommendations. A null
 * seed fetches nothing.
 */
const useRecommendations = (
  seed: RecommendationSeed | null
): UseRecommendationsResult => {
  const { source, isLoading: isLoadingSource } = useRecommendationSource(seed);

  const { data, isLoading: isLoadingRecommendations } =
    useGetDashboardRecommendationsQuery(
      { id: source?.workId ?? "", limit: FETCH_LIMIT },
      {
        enabled: source !== null,
        // The section is decorative: a failed request hides it instead of
        // throwing to the ErrorBoundary and taking the whole dashboard down.
        throwOnError: false
      }
    );

  const recommendations: RecommendedWork[] | null =
    data?.recommend.result.map(({ work }) => ({
      workId: work.workId as WorkId,
      title: work.titles.full.join(", "),
      author: work.creators.map((creator) => creator.display).join(", "),
      coverSrc: work.manifestations.bestRepresentation.cover.large?.url ?? null
    })) ?? null;

  return {
    result: source && recommendations ? { recommendations, source } : null,
    isLoading: isLoadingSource || isLoadingRecommendations
  };
};

export default useRecommendations;
