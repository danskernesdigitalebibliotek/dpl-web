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

const isFirstInSeries = (series: RelatedWorkSeries): boolean =>
  parseNumberInSeries(series.numberInSeries) === 1;

const isStandalone = (work: RelatedWork): boolean => work.series.length === 0;

// A work in the current series never counts, whether as "opens a series" or
// as "belongs to one" - the CQL already excludes the series, but only by
// title, and this also covers the works the NOT clause missed.
const isInCurrentSeries = (
  work: RelatedWork,
  currentSeries: CurrentSeries
): boolean => work.series.some((series) => isSameSeries(series, currentSeries));

/**
 * Selects which of the author's works the related-works slider shows, and in
 * what order. `works` is expected newest-first (the query sorts by first
 * edition descending); order within each tier is preserved from it.
 *
 * Three tiers, concatenated and cut at `limit`:
 *
 *   1. Works that open one of the author's other series ("Del 1") - the
 *      slider's reason to exist.
 *   2. Standalone works - padding that competes with nothing already shown.
 *   3. Anything left, i.e. later volumes and unnumbered series members -
 *      only when the slider would otherwise run short.
 */
export const getRelatedWorks = (
  works: readonly RelatedWork[],
  currentSeries: CurrentSeries,
  limit = 20
): RelatedWork[] => {
  const candidates = works.filter(
    (work) => !isInCurrentSeries(work, currentSeries)
  );

  const seriesFirsts = candidates.filter((work) =>
    work.series.some(isFirstInSeries)
  );
  const standalones = candidates.filter(isStandalone);
  const rest = candidates.filter(
    (work) => !seriesFirsts.includes(work) && !standalones.includes(work)
  );

  return [...seriesFirsts, ...standalones, ...rest].slice(0, limit);
};

/* ********************************* Vitest Section  ********************************* */
if (import.meta.vitest) {
  const { describe, expect, it } = import.meta.vitest;

  const CURRENT: CurrentSeries = { seriesId: "current-id", title: "Aktuel" };

  let nextId = 0;
  const work = ({
    title,
    series = []
  }: {
    title: string;
    series?: {
      id?: string | null;
      title: string;
      number?: string | null;
    }[];
  }): RelatedWork => ({
    workId: `work-of:test:${nextId++}` as RelatedWork["workId"],
    title,
    series: series.map((s) => ({
      seriesId: s.id === undefined ? `id-${s.title}` : s.id,
      title: s.title,
      numberInSeries: s.number ?? null,
      readThisFirst: null
    })),
    coverSrc: null
  });

  const titles = (result: RelatedWork[]) => result.map((w) => w.title);

  describe("getRelatedWorks", () => {
    it("puts series firsts before standalones before the rest", () => {
      const result = getRelatedWorks(
        [
          work({
            title: "Bind 3",
            series: [{ title: "Serie A", number: "Del 3" }]
          }),
          work({ title: "Alene" }),
          work({
            title: "Bind 1",
            series: [{ title: "Serie A", number: "Del 1" }]
          })
        ],
        CURRENT
      );

      expect(titles(result)).toEqual(["Bind 1", "Alene", "Bind 3"]);
    });

    it("recognises 'Bind 1' and 'Del 1' labels alike as firsts", () => {
      const result = getRelatedWorks(
        [
          work({
            title: "A",
            series: [{ title: "Serie A", number: "Bind 1" }]
          }),
          work({ title: "B", series: [{ title: "Serie B", number: "Del 1" }] })
        ],
        CURRENT
      );

      expect(titles(result)).toEqual(["A", "B"]);
    });

    it("drops every work belonging to the current series", () => {
      const result = getRelatedWorks(
        [
          work({
            title: "Egen del 1",
            series: [{ id: "current-id", title: "Aktuel", number: "Del 1" }]
          }),
          work({
            title: "Anden serie",
            series: [{ title: "Serie B", number: "Del 2" }]
          })
        ],
        CURRENT
      );

      expect(titles(result)).toEqual(["Anden serie"]);
    });

    it("matches the current series by title when it has no id", () => {
      const result = getRelatedWorks(
        [
          work({
            title: "Egen del 1",
            series: [{ id: null, title: "Aktuel", number: "Del 1" }]
          })
        ],
        { seriesId: null, title: "Aktuel" }
      );

      expect(result).toEqual([]);
    });

    it("treats unnumbered series members as leftovers", () => {
      // No member parses as part 1, so they only pad once standalones run out.
      const result = getRelatedWorks(
        [
          work({
            title: "Nyeste",
            series: [{ title: "Unummereret", number: null }]
          }),
          work({
            title: "Ældre",
            series: [{ title: "Unummereret", number: null }]
          }),
          work({ title: "Alene" })
        ],
        CURRENT,
        2
      );

      expect(titles(result)).toEqual(["Alene", "Nyeste"]);
    });

    it("pads with later volumes only when the limit leaves room", () => {
      const withRoom = getRelatedWorks(
        [
          work({
            title: "Bind 1",
            series: [{ title: "Serie A", number: "Del 1" }]
          }),
          work({
            title: "Bind 2",
            series: [{ title: "Serie A", number: "Del 2" }]
          })
        ],
        CURRENT,
        2
      );
      const withoutRoom = getRelatedWorks(
        [
          work({
            title: "Bind 1",
            series: [{ title: "Serie A", number: "Del 1" }]
          }),
          work({
            title: "Bind 2",
            series: [{ title: "Serie A", number: "Del 2" }]
          }),
          work({ title: "Alene" })
        ],
        CURRENT,
        2
      );

      expect(titles(withRoom)).toEqual(["Bind 1", "Bind 2"]);
      expect(titles(withoutRoom)).toEqual(["Bind 1", "Alene"]);
    });

    it("caps the result", () => {
      const result = getRelatedWorks(
        Array.from({ length: 30 }, (_, i) => work({ title: `Værk ${i}` })),
        CURRENT
      );

      expect(result).toHaveLength(20);
    });

    it("never picks the same work twice", () => {
      // Opens two series at once: eligible for pass 1 via either, and its
      // second series must not re-admit it.
      const result = getRelatedWorks(
        [
          work({
            title: "Dobbelt",
            series: [
              { title: "Serie A", number: "Del 1" },
              { title: "Serie B", number: "Del 1" }
            ]
          })
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
