import type { TBookQuizRange } from "./questions"

// Books shown per section.
export const BOOKS_PER_STEP = 3
// How many years a work's age span may reach outside the chosen range.
export const MAX_AGE_SPILL = 2

// The smallest shape rank needs, so it works with any query that includes
// audience ages on the manifestations.
export type TRankableWork = {
  workId: string
  manifestations: {
    all: { audience?: { ages: { begin?: number | null; end?: number | null }[] } | null }[]
  }
}

// Age data is often only set on the physical edition, so the first
// manifestation with ages wins. A missing begin or end falls back to the other.
export const getWorkAgeSpan = (work: TRankableWork): TBookQuizRange | null => {
  for (const { audience } of work.manifestations.all) {
    for (const age of audience?.ages ?? []) {
      const begin = age.begin ?? age.end
      const end = age.end ?? age.begin
      if (begin != null && end != null) return [begin, end]
    }
  }
  return null
}

// Years the work's age span reaches outside the chosen range. 0 means fully
// inside. The CQL age filter only guarantees overlap, so without this a 10–14
// book would rank as high as a 9–10 book. Null when the work has no age data.
export const getAgeSpill = (
  work: TRankableWork,
  range: TBookQuizRange | undefined
): number | null => {
  if (!range) return 0
  const span = getWorkAgeSpan(work)
  if (!span) return null
  return Math.max(0, range[0] - span[0]) + Math.max(0, span[1] - range[1])
}

// Top books for one ladder step: works reaching more than MAX_AGE_SPILL years
// outside the range are dropped, then the smallest spill wins, then FBI's own
// order. Works without age data go last. Steps are ranked independently, so
// the same book can appear in several sections.
export const rankStepWorks = <TWork extends TRankableWork>(
  works: TWork[],
  ageRange: TBookQuizRange | undefined
): TWork[] =>
  works
    .map((work, index) => ({ work, index, spill: getAgeSpill(work, ageRange) }))
    .filter(entry => entry.spill === null || entry.spill <= MAX_AGE_SPILL)
    .sort((a, b) => (a.spill ?? Infinity) - (b.spill ?? Infinity) || a.index - b.index)
    .slice(0, BOOKS_PER_STEP)
    .map(entry => entry.work)
