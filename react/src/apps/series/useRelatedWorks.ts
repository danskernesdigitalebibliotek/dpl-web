import {
  SortOrderEnum,
  useGetCoversByPidsQuery,
  useGetRelatedWorksQuery
} from "../../core/dbc-gateway/generated/graphql";
import { getCoverUrl } from "../../components/cover/helper";
import { Pid, WorkId } from "../../core/utils/types/ids";
import { getRelatedWorks } from "./getRelatedWorks";
import { RelatedWork } from "./relatedWorks.types";

export type UseRelatedWorksArgs = {
  // The series page's derived author (getSeriesAuthor); null hides the
  // section, so no query runs.
  author: string | null;
  currentSeries: {
    seriesId: string | null;
    title: string;
    // First entry of Series.mainLanguages; null drops the language clause.
    mainLanguage: string | null;
  };
};

export type UseRelatedWorksResult = {
  works: RelatedWork[];
  isLoading: boolean;
};

// The fill algorithm picks at most 20; fetching well past that leaves it
// slack to skip later volumes of the same series. Authors with more than a
// hundred candidate books exist, but by then the slider is full many times
// over, so a second page is never worth the request.
const FETCH_LIMIT = 100;

// Books by the author, excluding the series the page is about. The language
// clause keeps translated editions of the same works out (Vildheks vs.
// Wildwitch). Values are interpolated unescaped like the rest of the
// codebase's CQL building (see prepareCreatorCql) - the gateway treats a
// quote in a name as a search miss, not an error.
const buildCql = ({ author, currentSeries }: UseRelatedWorksArgs): string => {
  const anded = [
    `term.creator='${author}'`,
    "phrase.generalmaterialtype='bøger'",
    ...(currentSeries.mainLanguage
      ? [`phrase.mainlanguage="${currentSeries.mainLanguage}"`]
      : [])
  ].join(" AND ");

  return `${anded} NOT term.series='${currentSeries.title}'`;
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
      enabled: !!author,
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
      creators: work.creators.map((creator) => creator.display),
      year: work.workYear?.year ?? null,
      series: work.series.map((series) => ({
        seriesId: series.seriesId ?? null,
        title: series.title,
        numberInSeries: series.numberInSeries ?? null,
        readThisFirst: series.readThisFirst ?? null
      })),
      coverPid: work.manifestations.bestRepresentation.pid as Pid
    })) ?? [];

  const picked = getRelatedWorks(candidates, currentSeries);

  // One batched lookup for the covers of the picked works only - the cards
  // are static components that take a resolved image url, unlike the member
  // list's cover component which fetches per card.
  const { data: coverData } = useGetCoversByPidsQuery(
    { pids: picked.map((work) => work.coverPid) },
    { enabled: picked.length > 0, throwOnError: false }
  );

  const coverManifestations =
    coverData?.manifestations.filter(
      (manifestation) => manifestation !== null
    ) ?? [];

  const works = picked.map((work) => ({
    ...work,
    coverSrc: getCoverUrl({
      coverData: coverManifestations.filter(
        (manifestation) => manifestation.pid === work.coverPid
      ),
      size: "large"
    })
  }));

  return {
    works,
    // isLoading is false while the query is disabled (no author), so the
    // section skips straight to its hidden state. The covers arrive
    // separately and later: cards render immediately with the tinted
    // placeholder and fill in as the batch lands.
    isLoading
  };
};

export default useRelatedWorks;
