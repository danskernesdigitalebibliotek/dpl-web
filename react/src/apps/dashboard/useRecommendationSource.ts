import {
  useGetDashboardRecommendationSourceByIsbnQuery,
  useGetDashboardRecommendationSourceQuery
} from "../../core/dbc-gateway/generated/graphql";
import { createIsbnCql } from "../../components/cover/helper";
import { WorkId } from "../../core/utils/types/ids";
import { recommendationQueryOptions } from "./recommendationQueryOptions";
import { RecommendationSeed } from "./recommendationSeed";
import { RecommendationSource } from "./recommendations.types";

export type UseRecommendationSourceResult = {
  source: RecommendationSource | null;
  isLoading: boolean;
};

/**
 * Resolves a seed to the work it identifies. Fausts and work ids are looked up
 * exactly through the work field. It has no ISBN argument, so ISBNs go through
 * complex search instead. A seed the gateway does not know or cannot name
 * resolves to nothing.
 */
const useRecommendationSource = (
  seed: RecommendationSeed
): UseRecommendationSourceResult => {
  const isbn = seed.type === "isbn" ? seed.isbn : null;

  const workArguments =
    seed.type === "faust"
      ? { faust: seed.faust }
      : seed.type === "work-id"
        ? { id: seed.workId }
        : null;

  const { data: workLookup, isLoading: isLoadingWork } =
    useGetDashboardRecommendationSourceQuery(workArguments ?? {}, {
      ...recommendationQueryOptions,
      enabled: workArguments !== null
    });

  const { data: isbnLookup, isLoading: isLoadingIsbn } =
    useGetDashboardRecommendationSourceByIsbnQuery(
      { cql: createIsbnCql(isbn ? [isbn] : []) },
      { ...recommendationQueryOptions, enabled: isbn !== null }
    );

  const resolvedWork = workLookup?.work ?? isbnLookup?.complexSearch.works[0];
  const title = resolvedWork?.titles.full.join(", ");

  // A work without a title cannot be named in the heading, so it does not count
  // as a source: the section stays hidden, as for any seed that does not resolve.
  const source: RecommendationSource | null =
    resolvedWork && title
      ? { origin: seed.origin, workId: resolvedWork.workId as WorkId, title }
      : null;

  return { source, isLoading: isLoadingWork || isLoadingIsbn };
};

export default useRecommendationSource;
