import { useGetDashboardRecommendationsQuery } from "../../core/dbc-gateway/generated/graphql";
import { FaustId, WorkId } from "../../core/utils/types/ids";
import { RecommendedWork } from "./recommendations.types";

export type UseRecommendationsResult = {
  works: RecommendedWork[];
  isLoading: boolean;
};

const FETCH_LIMIT = 10;

const useRecommendations = (faust: FaustId): UseRecommendationsResult => {
  const { data, isLoading } = useGetDashboardRecommendationsQuery(
    { faust, limit: FETCH_LIMIT },
    {
      // The section is decorative: a failed request hides it (works stays
      // empty) instead of throwing to the ErrorBoundary and taking the whole
      // dashboard down with it.
      throwOnError: false
    }
  );

  const works: RecommendedWork[] =
    data?.recommend.result.map(({ work }) => ({
      workId: work.workId as WorkId,
      title: work.titles.full.join(", "),
      author: work.creators.map((creator) => creator.display).join(", "),
      coverSrc: work.manifestations.bestRepresentation.cover.large?.url ?? null
    })) ?? [];

  return { works, isLoading };
};

export default useRecommendations;
