import {
  useGetBestRepresentationPidByIsbnQuery,
  useGetDashboardRecommendationsQuery
} from "../../core/dbc-gateway/generated/graphql";
import { createIsbnCql } from "../../components/cover/helper";
import { WorkId } from "../../core/utils/types/ids";
import { RecommendationSource } from "./recommendationSource";
import { RecommendedWork } from "./recommendations.types";

export type UseRecommendationsResult = {
  works: RecommendedWork[];
  isLoading: boolean;
};

const FETCH_LIMIT = 10;

/**
 * Fetches recommendations for a source. The recommender only understands
 * fausts and work ids, so an ISBN source first goes through a lookup that
 * resolves it to a work id. A null source fetches nothing.
 */
const useRecommendations = (
  source: RecommendationSource | null
): UseRecommendationsResult => {
  const isbn = source?.type === "isbn" ? source.isbn : null;

  const { data: isbnLookup, isLoading: isLoadingIsbnLookup } =
    useGetBestRepresentationPidByIsbnQuery(
      {
        cql: createIsbnCql(isbn ? [isbn] : []),
        offset: 0,
        limit: 1,
        filters: {}
      },
      { enabled: isbn !== null, throwOnError: false }
    );

  const workIdFromIsbn = isbnLookup?.complexSearch.works[0]?.workId as
    WorkId | undefined;

  const recommendArguments = (() => {
    switch (source?.type) {
      case "faust":
        return { faust: source.faust };
      case "work-id":
        return { id: source.workId };
      case "isbn":
        return workIdFromIsbn ? { id: workIdFromIsbn } : null;
      default:
        return null;
    }
  })();

  const { data, isLoading: isLoadingRecommendations } =
    useGetDashboardRecommendationsQuery(
      { ...recommendArguments, limit: FETCH_LIMIT },
      {
        // Nothing to ask for without a source, or until an ISBN source has been
        // resolved.
        enabled: recommendArguments !== null,
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

  // A disabled query reports isLoading as false, so during the ISBN lookup
  // only the lookup's flag is set. Once resolved the recommend query takes
  // over. An ISBN that resolves to nothing ends up neither loading nor with
  // data, which reads as "no recommendations" to the caller.
  return {
    works,
    isLoading: isLoadingIsbnLookup || isLoadingRecommendations
  };
};

export default useRecommendations;
