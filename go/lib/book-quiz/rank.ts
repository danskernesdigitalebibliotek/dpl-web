import type { TBookQuizRange } from "./questions"

// Books shown per section at a time.
export const BOOKS_PER_STEP = 4

// The smallest shape rank needs, so it works with any query that includes
// audience ages on the manifestations.
export type TRankableWork = {
  workId: string
  manifestations: {
    all: { audience?: { ages: { begin?: number | null; end?: number | null }[] } | null }[]
  }
}

// The age spans of the work's editions. Age data is often only set on some of
// them. A missing begin or end falls back to the other.
export const getWorkAgeSpans = (work: TRankableWork): TBookQuizRange[] =>
  work.manifestations.all.flatMap(({ audience }) =>
    (audience?.ages ?? []).flatMap((age): TBookQuizRange[] => {
      const begin = age.begin ?? age.end
      const end = age.end ?? age.begin
      return begin != null && end != null ? [[begin, end]] : []
    })
  )

// Years the best fitting edition reaches outside the chosen range. 0 means
// fully inside. The search matches per edition too, see ageCql in ladder.ts.
// Null when the work has no age data.
export const getAgeSpill = (work: TRankableWork, range: TBookQuizRange): number | null => {
  const spills = getWorkAgeSpans(work).map(
    ([begin, end]) => Math.max(0, range[0] - begin) + Math.max(0, end - range[1])
  )
  return spills.length > 0 ? Math.min(...spills) : null
}

// All books that fit one ladder step, best first: the smallest spill wins,
// then FBI's own order. Works without age data go last. No works are dropped,
// as the search already leaves out the books that reach too far outside the
// chosen ages. Without a chosen age FBI's order is kept. Steps are ranked
// independently, so the same book can appear in several sections.
export const getStepWorkPool = <TWork extends TRankableWork>(
  works: TWork[],
  ageRange: TBookQuizRange | undefined
): TWork[] => {
  if (!ageRange) return works

  return works
    .map((work, index) => ({ work, index, spill: getAgeSpill(work, ageRange) }))
    .sort((a, b) => (a.spill ?? Infinity) - (b.spill ?? Infinity) || a.index - b.index)
    .map(entry => entry.work)
}
