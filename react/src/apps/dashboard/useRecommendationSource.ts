import {
  useGetDashboardRecommendationSourceByIsbnQuery,
  useGetDashboardRecommendationSourceQuery
} from "../../core/dbc-gateway/generated/graphql";
import { createIsbnCql } from "../../components/cover/helper";
import { WorkId } from "../../core/utils/types/ids";
import { RecommendationSeed } from "./recommendationSeed";
import { RecommendationSource } from "./recommendations.types";

export type UseRecommendationSourceResult = {
  source: RecommendationSource | null;
  isLoading: boolean;
};

/**
 * Resolves a seed to the work it identifies. Fausts and work ids are looked up
 * exactly through the work field. It has no ISBN argument, so ISBNs go through
 * complex search instead. A null seed resolves to nothing, as does a seed the
 * gateway does not know or cannot name.
 */
const useRecommendationSource = (
  seed: RecommendationSeed | null
): UseRecommendationSourceResult => {
  const isbn = seed?.type === "isbn" ? seed.isbn : null;

  const workArguments =
    seed?.type === "faust"
      ? { faust: seed.faust }
      : seed?.type === "work-id"
        ? { id: seed.workId }
        : null;

  // Both queries have throwOnError off: the section is decorative, so a
  // failed lookup hides it instead of taking the whole dashboard down.
  const { data: workLookup, isLoading: isLoadingWork } =
    useGetDashboardRecommendationSourceQuery(workArguments ?? {}, {
      enabled: workArguments !== null,
      throwOnError: false
    });

  const { data: isbnLookup, isLoading: isLoadingIsbn } =
    useGetDashboardRecommendationSourceByIsbnQuery(
      { cql: createIsbnCql(isbn ? [isbn] : []) },
      { enabled: isbn !== null, throwOnError: false }
    );

  const resolvedWork = workLookup?.work ?? isbnLookup?.complexSearch.works[0];
  const title = resolvedWork?.titles.full.join(", ");

  // A work without a title cannot be named in the heading, so it does not count
  // as a source: the section stays hidden, as for any seed that does not resolve.
  const source: RecommendationSource | null =
    seed && resolvedWork && title
      ? { origin: seed.origin, workId: resolvedWork.workId as WorkId, title }
      : null;

  return { source, isLoading: isLoadingWork || isLoadingIsbn };
};

export default useRecommendationSource;
