import { RelatedWork } from "./relatedWorks.types";
import { relatedWorksFixture } from "./relatedWorksFixture";

export type UseRelatedWorksArgs = {
  // The series page's derived author (getSeriesAuthor); null hides the
  // section, so no query should run.
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

// MOCKED implementation. The contract is final; the internals are not: a
// later commit replaces the fixture with the real pipeline (CQL built from
// the args -> complex search sorted by first edition, newest first -> the
// fill algorithm picking series firsts and padding with newest works).
// The fixture is returned raw and unfiltered, so while jamming on the design
// the slider simply shows Lene Kaaberbøl's books newest-first, regardless of
// which series page hosts it.
const useRelatedWorks = ({
  author
}: UseRelatedWorksArgs): UseRelatedWorksResult => {
  if (!author) {
    return { works: [], isLoading: false };
  }

  return { works: relatedWorksFixture, isLoading: false };
};

export default useRelatedWorks;
