import {
  SortOrderEnum,
  useGetRelatedWorksQuery
} from "../../core/dbc-gateway/generated/graphql";
import { cqlString } from "../../core/utils/helpers/cql";
import { WorkId } from "../../core/utils/types/ids";
import { DISPLAY_LIMIT, getRelatedWorks } from "./getRelatedWorks";
import { RelatedWork } from "./relatedWorks.types";

export type UseRelatedWorksArgs = {
  author: string;
  currentSeries: {
    seriesId: string | null;
    title: string;
    mainLanguage: string | null;
  };
};

export type UseRelatedWorksResult = {
  works: RelatedWork[];
  isLoading: boolean;
};

// Over-fetch so the fill algorithm has slack: articles and later series
// volumes display last, and for a prolific author they can make up much of a
// newest-first page. A wider page is cheaper than a second books-only query
// until an author outgrows it.
const FETCH_LIMIT = DISPLAY_LIMIT * 5;

// Works by the author, excluding the series the page is about. The language
// clause keeps translated editions of the same works out (Vildheks vs.
// Wildwitch).
const buildCql = ({ author, currentSeries }: UseRelatedWorksArgs): string => {
  const anded = [
    `(phrase.creator="${cqlString(author)}" or phrase.creator="${cqlString(author)} (*)")`,
    ...(currentSeries.mainLanguage
      ? [`phrase.mainlanguage="${cqlString(currentSeries.mainLanguage)}"`]
      : [])
  ].join(" AND ");

  return `${anded} NOT term.series="${cqlString(currentSeries.title)}"`;
};

const useRelatedWorks = ({
  author,
  currentSeries
}: UseRelatedWorksArgs): UseRelatedWorksResult => {
  const { data, isLoading } = useGetRelatedWorksQuery(
    {
      cql: buildCql({ author, currentSeries }),
      offset: 0,
      limit: FETCH_LIMIT,
      filters: {},
      // First edition year, newest first: "the author's latest work", immune
      // to reprints (sort.latestpublicationdate would surface a 1995 novel
      // reissued last month).
      sort: [{ index: "sort.datefirstedition", order: SortOrderEnum.Desc }]
    },
    {
      // The section is decorative: a failed request hides it (works stays
      // empty) instead of throwing to the ErrorBoundary and taking the
      // whole series page down with it.
      throwOnError: false
    }
  );

  const candidates: RelatedWork[] =
    data?.complexSearch.works.map((work) => ({
      workId: work.workId as WorkId,
      title: work.titles.full.join(", "),
      series: work.series.map((series) => ({
        seriesId: series.seriesId ?? null,
        title: series.title,
        numberInSeries: series.numberInSeries ?? null,
        readThisFirst: series.readThisFirst ?? null
      })),
      workTypes: work.workTypes,
      coverSrc: work.manifestations.bestRepresentation.cover.large?.url ?? null
    })) ?? [];

  return {
    works: getRelatedWorks(candidates, currentSeries),
    isLoading
  };
};

export default useRelatedWorks;
