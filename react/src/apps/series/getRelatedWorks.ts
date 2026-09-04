import { parseNumberInSeries } from "./helper";
import { RelatedWork, RelatedWorkSeries } from "./relatedWorks.types";

export type CurrentSeries = {
  seriesId: string | null;
  title: string;
};

// A series has no stable single key: seriesId is nullable in the API, so the
// title stands in when it is missing. Prefixed so a null-id series named like
// an id can't collide with a real one.
const seriesKey = (series: {
  seriesId: string | null;
  title: string;
}): string => (series.seriesId ? `id:${series.seriesId}` : `t:${series.title}`);

const isSameSeries = (
  a: { seriesId: string | null; title: string },
  b: { seriesId: string | null; title: string }
): boolean => seriesKey(a) === seriesKey(b);

// The memberships that matter for picking works: the current page's own
// series never counts, whether as "opens a series" or as "belongs to one" -
// the CQL already excludes it, but only by title, and this also covers the
// works the NOT clause missed.
const otherSeries = (
  work: RelatedWork,
  currentSeries: CurrentSeries
): RelatedWorkSeries[] =>
  work.series.filter((series) => !isSameSeries(series, currentSeries));

const opensSeries = (series: RelatedWorkSeries): boolean =>
  parseNumberInSeries(series.numberInSeries) === 1;

/**
 * Selects which of the author's works the related-works slider shows, and in
 * what order. `works` is expected newest-first (the query sorts by first
 * edition descending); order within each pass is preserved from it.
 *
 * Fill passes, run until `cap` works are picked:
 *
 *   1. Works that open one of the author's other series ("Del 1"), one per
 *      series - the slider's reason to exist.
 *   2. Standalone works - padding that competes with nothing already shown.
 *   3. Works from series not yet represented - e.g. an unnumbered series that
 *      has no recognisable first; again one per series.
 *   4. Anything left, i.e. later volumes of series already shown - only when
 *      the slider would otherwise run short.
 */
export const getRelatedWorks = (
  works: readonly RelatedWork[],
  currentSeries: CurrentSeries,
  cap = 20
): RelatedWork[] => {
  const picked: RelatedWork[] = [];
  const pickedWorkIds = new Set<string>();
  const representedSeries = new Set<string>();

  const pick = (work: RelatedWork) => {
    picked.push(work);
    pickedWorkIds.add(work.workId);
    otherSeries(work, currentSeries).forEach((series) =>
      representedSeries.add(seriesKey(series))
    );
  };

  // Every work in the current series is dropped up front so no pass can pad
  // with them - the page already lists the whole series above.
  const candidates = works.filter(
    (work) =>
      work.series.length === 0 ||
      otherSeries(work, currentSeries).length === work.series.length
  );

  const passes: ((work: RelatedWork) => boolean)[] = [
    // 1: series firsts, one per series.
    (work) =>
      otherSeries(work, currentSeries).some(
        (series) =>
          opensSeries(series) && !representedSeries.has(seriesKey(series))
      ),
    // 2: standalones.
    (work) => work.series.length === 0,
    // 3: unrepresented series, one per series.
    (work) =>
      otherSeries(work, currentSeries).some(
        (series) => !representedSeries.has(seriesKey(series))
      ),
    // 4: whatever is left.
    () => true
  ];

  passes.forEach((accepts) => {
    candidates.forEach((work) => {
      if (
        picked.length < cap &&
        !pickedWorkIds.has(work.workId) &&
        accepts(work)
      ) {
        pick(work);
      }
    });
  });

  return picked;
};

/* ********************************* Vitest Section  ********************************* */
if (import.meta.vitest) {
  const { describe, expect, it } = import.meta.vitest;

  const CURRENT: CurrentSeries = { seriesId: "current-id", title: "Aktuel" };

  let nextId = 0;
  const work = (
    title: string,
    series: {
      id?: string | null;
      title: string;
      number?: string | null;
    }[] = []
  ): RelatedWork => ({
    workId: `work-of:test:${nextId++}` as RelatedWork["workId"],
    title,
    creators: ["Testforfatter"],
    year: null,
    series: series.map((s) => ({
      seriesId: s.id === undefined ? `id-${s.title}` : s.id,
      title: s.title,
      numberInSeries: s.number ?? null,
      readThisFirst: null
    })),
    coverPid: "870970-basis:00000001" as RelatedWork["coverPid"]
  });

  const titles = (result: RelatedWork[]) => result.map((w) => w.title);

  describe("getRelatedWorks", () => {
    it("puts series firsts before standalones before the rest", () => {
      const result = getRelatedWorks(
        [
          work("Bind 3", [{ title: "Serie A", number: "Del 3" }]),
          work("Alene"),
          work("Bind 1", [{ title: "Serie A", number: "Del 1" }])
        ],
        CURRENT
      );

      expect(titles(result)).toEqual(["Bind 1", "Alene", "Bind 3"]);
    });

    it("keeps only the newest first per series", () => {
      const result = getRelatedWorks(
        [
          work("Samling 1", [{ title: "Serie A", number: "Del 1" }]),
          work("Bind 1", [{ title: "Serie A", number: "Del 1" }])
        ],
        CURRENT,
        1
      );

      expect(titles(result)).toEqual(["Samling 1"]);
    });

    it("recognises 'Bind 1' and 'Del 1' labels alike as firsts", () => {
      const result = getRelatedWorks(
        [
          work("A", [{ title: "Serie A", number: "Bind 1" }]),
          work("B", [{ title: "Serie B", number: "Del 1" }])
        ],
        CURRENT
      );

      expect(titles(result)).toEqual(["A", "B"]);
    });

    it("drops every work belonging to the current series", () => {
      const result = getRelatedWorks(
        [
          work("Egen del 1", [
            { id: "current-id", title: "Aktuel", number: "Del 1" }
          ]),
          work("Anden serie", [{ title: "Serie B", number: "Del 2" }])
        ],
        CURRENT
      );

      expect(titles(result)).toEqual(["Anden serie"]);
    });

    it("matches the current series by title when it has no id", () => {
      const result = getRelatedWorks(
        [work("Egen del 1", [{ id: null, title: "Aktuel", number: "Del 1" }])],
        { seriesId: null, title: "Aktuel" }
      );

      expect(result).toEqual([]);
    });

    it("represents an unnumbered series with its newest member", () => {
      // No member parses as part 1, so the series surfaces via pass 3 - once.
      const result = getRelatedWorks(
        [
          work("Nyeste", [{ title: "Unummereret", number: null }]),
          work("Ældre", [{ title: "Unummereret", number: null }]),
          work("Alene")
        ],
        CURRENT,
        2
      );

      expect(titles(result)).toEqual(["Alene", "Nyeste"]);
    });

    it("pads with later volumes only when the cap leaves room", () => {
      const withRoom = getRelatedWorks(
        [
          work("Bind 1", [{ title: "Serie A", number: "Del 1" }]),
          work("Bind 2", [{ title: "Serie A", number: "Del 2" }])
        ],
        CURRENT,
        2
      );
      const without = getRelatedWorks(
        [
          work("Bind 1", [{ title: "Serie A", number: "Del 1" }]),
          work("Bind 2", [{ title: "Serie A", number: "Del 2" }]),
          work("Alene")
        ],
        CURRENT,
        2
      );

      expect(titles(withRoom)).toEqual(["Bind 1", "Bind 2"]);
      expect(titles(without)).toEqual(["Bind 1", "Alene"]);
    });

    it("caps the result", () => {
      const result = getRelatedWorks(
        Array.from({ length: 30 }, (_, i) => work(`Værk ${i}`)),
        CURRENT
      );

      expect(result).toHaveLength(20);
    });

    it("never picks the same work twice", () => {
      // Opens two series at once: eligible for pass 1 via either, and its
      // second series must not re-admit it.
      const result = getRelatedWorks(
        [
          work("Dobbelt", [
            { title: "Serie A", number: "Del 1" },
            { title: "Serie B", number: "Del 1" }
          ])
        ],
        CURRENT
      );

      expect(titles(result)).toEqual(["Dobbelt"]);
    });

    it("returns an empty list for an empty response", () => {
      expect(getRelatedWorks([], CURRENT)).toEqual([]);
    });
  });
}
