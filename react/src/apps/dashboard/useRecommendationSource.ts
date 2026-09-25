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

type ResolvedWork = {
  workId: string;
  titles: { full: string[] };
};

const toSource = (
  seed: RecommendationSeed,
  work: ResolvedWork
): RecommendationSource => ({
  origin: seed.origin,
  workId: work.workId as WorkId,
  title: work.titles.full.length > 0 ? work.titles.full.join(", ") : null
});

/**
 * Resolves a seed to the work it identifies. Fausts and work ids are looked up
 * exactly through the work field. It has no ISBN argument, so ISBNs go through
 * complex search instead. A null seed resolves to nothing, as does a seed the
 * gateway does not know.
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

  const resolvedWork: ResolvedWork | null =
    workLookup?.work ?? isbnLookup?.complexSearch.works[0] ?? null;

  return {
    source: seed && resolvedWork ? toSource(seed, resolvedWork) : null,
    isLoading: isLoadingWork || isLoadingIsbn
  };
};

export default useRecommendationSource;
