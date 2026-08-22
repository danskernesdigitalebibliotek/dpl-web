export type SortableSeriesMember = {
  numberInSeries?: string | null;
  work: {
    workYear?: { year?: number | null } | null;
  };
};

// numberInSeries is a String, and despite the schema calling it "the number of
// work in the series as a number (as text)" the values are pre-labelled and
// localised — "Del 1", "Bind 2" — so the number has to be extracted. Number()
// would give NaN for those, and 0 for an empty string, which would be
// indistinguishable from a real part 0.
const FIRST_NUMBER_PATTERN = /\d+(?:[.,]\d+)?/;

const parseNumberInSeries = (numberInSeries?: string | null): number | null => {
  if (!numberInSeries) {
    return null;
  }

  const match = numberInSeries.match(FIRST_NUMBER_PATTERN);

  if (!match) {
    return null;
  }

  return Number(match[0].replace(",", "."));
};

// Ascending, with missing values pushed to the end.
const compareAscendingNullsLast = (
  a: number | null,
  b: number | null
): number => {
  if (a !== null && b !== null) {
    return a - b;
  }
  if (a !== null) {
    return -1;
  }
  if (b !== null) {
    return 1;
  }
  return 0;
};

// Part number ascending; then publication year ascending, but only for members
// that have no part number.
//
// Two non-behaviours, both matching bibliotek.dk's series pages:
//
//   - Year is not a tie-breaker between members sharing a part number.
//     "Ravnenes hvisken" has 12 members numbered "Del 1", some from 2016 and
//     some undated, and bibliotek.dk interleaves them.
//   - Equal part numbers keep the order the API returned. Array.prototype.sort
//     is stable, so returning 0 preserves it. It looks arbitrary because it is,
//     but inventing a tie-breaker would diverge from bibliotek.dk.
//
// readThisFirst deliberately has no effect on order: "Begynd med denne" is not
// necessarily part 1, so it only drives a badge.
const compareSeriesMembers = (
  a: SortableSeriesMember,
  b: SortableSeriesMember
): number => {
  const partA = parseNumberInSeries(a.numberInSeries);
  const partB = parseNumberInSeries(b.numberInSeries);

  if (partA !== null && partB !== null) {
    return partA - partB;
  }

  if (partA !== null) {
    return -1;
  }
  if (partB !== null) {
    return 1;
  }

  return compareAscendingNullsLast(
    a.work.workYear?.year ?? null,
    b.work.workYear?.year ?? null
  );
};

// The spread is required, not stylistic: sort() mutates in place and the array
// belongs to TanStack Query's cache, so sorting it directly would rewrite
// cached data without React knowing it changed.
export const sortSeriesMembers = <T extends SortableSeriesMember>(
  members: readonly T[]
): T[] => [...members].sort(compareSeriesMembers);

export type MemberWithCreators = {
  work: {
    creators: { display: string }[];
  };
};

// A series has no author of its own in the API, so the members' primary
// creators stand in for it.
//
// Only the first creator of each member counts, not all of them, or a
// prolific illustrator could outvote the writer. The most frequent one wins,
// so a guest author on a single volume does not change whose series it is, and
// ties keep the order the members arrived in. Null when no member names anyone,
// which is the signal to render no byline at all.
export const getSeriesAuthor = (
  members: readonly MemberWithCreators[]
): string | null => {
  const counts = new Map<string, number>();

  members.forEach((member) => {
    const [primaryCreator] = member.work.creators;

    if (!primaryCreator) {
      return;
    }

    const name = primaryCreator.display;
    counts.set(name, (counts.get(name) ?? 0) + 1);
  });

  let author: string | null = null;
  let highestCount = 0;

  counts.forEach((count, name) => {
    // Strictly greater, so the earliest of a tie is kept.
    if (count > highestCount) {
      author = name;
      highestCount = count;
    }
  });

  return author;
};

/* ********************************* Vitest Section  ********************************* */
if (import.meta.vitest) {
  const { describe, expect, it } = import.meta.vitest;

  const authored = (...names: string[]): MemberWithCreators => ({
    work: { creators: names.map((display) => ({ display })) }
  });

  describe("getSeriesAuthor", () => {
    it("returns the creator shared by the members", () => {
      expect(
        getSeriesAuthor([
          authored("Malene Sølvsten"),
          authored("Malene Sølvsten")
        ])
      ).toBe("Malene Sølvsten");
    });

    it("ignores a guest author on a single volume", () => {
      expect(
        getSeriesAuthor([
          authored("J.K. Rowling"),
          authored("J.K. Rowling"),
          authored("John Tiffany")
        ])
      ).toBe("J.K. Rowling");
    });

    it("only counts the primary creator of each member", () => {
      // The illustrator appears on every volume but is never listed first.
      expect(
        getSeriesAuthor([
          authored("Malene Sølvsten", "En Illustrator"),
          authored("Malene Sølvsten", "En Illustrator")
        ])
      ).toBe("Malene Sølvsten");
    });

    it("keeps the first of a tie", () => {
      expect(getSeriesAuthor([authored("Først"), authored("Sidst")])).toBe(
        "Først"
      );
    });

    it("returns null when no member names a creator", () => {
      expect(getSeriesAuthor([authored(), authored()])).toBeNull();
    });

    it("returns null for an empty series", () => {
      expect(getSeriesAuthor([])).toBeNull();
    });
  });

  const member = (
    numberInSeries: string | null,
    year: number | null = null
  ): SortableSeriesMember => ({
    numberInSeries,
    work: { workYear: year === null ? null : { year } }
  });

  describe("parseNumberInSeries", () => {
    it("reads a plain number", () => {
      expect(parseNumberInSeries("3")).toBe(3);
    });

    it("reads a number from the pre-labelled form the API returns", () => {
      expect(parseNumberInSeries("Del 3")).toBe(3);
    });

    it("reads a volume label the same way as a part label", () => {
      expect(parseNumberInSeries("Bind 1")).toBe(1);
    });

    it("takes the first number of a range", () => {
      expect(parseNumberInSeries("3-4")).toBe(3);
    });

    it("accepts a comma as decimal separator", () => {
      expect(parseNumberInSeries("1,5")).toBe(1.5);
    });

    it("accepts a period as decimal separator", () => {
      expect(parseNumberInSeries("1.5")).toBe(1.5);
    });

    it("treats zero as a real part number, not as missing", () => {
      expect(parseNumberInSeries("Del 0")).toBe(0);
    });

    it.each([null, undefined, "", "   ", "uden nummer"])(
      "returns null for %p",
      (input) => {
        expect(parseNumberInSeries(input)).toBeNull();
      }
    );
  });

  describe("sortSeriesMembers", () => {
    const partNumbers = (members: SortableSeriesMember[]) =>
      sortSeriesMembers(members).map((m) => m.numberInSeries);

    it("orders part numbers numerically, not alphabetically", () => {
      expect(
        partNumbers([member("Del 10"), member("Del 2"), member("Del 1")])
      ).toEqual(["Del 1", "Del 2", "Del 10"]);
    });

    it("keeps part 0 first rather than treating it as missing", () => {
      expect(
        partNumbers([member("Del 2"), member("Del 0"), member("Del 1")])
      ).toEqual(["Del 0", "Del 1", "Del 2"]);
    });

    it("interleaves volumes with parts of the same number", () => {
      expect(
        partNumbers([member("Del 2"), member("Bind 1"), member("Del 1")])
      ).toEqual(["Bind 1", "Del 1", "Del 2"]);
    });

    it("puts members without a part number last", () => {
      expect(
        partNumbers([member(null), member("Del 2"), member("Del 1")])
      ).toEqual(["Del 1", "Del 2", null]);
    });

    it("orders members without a part number by year, oldest first", () => {
      const sorted = sortSeriesMembers([
        member(null, 2020),
        member(null, 1999),
        member(null, 2005)
      ]);

      expect(sorted.map((m) => m.work.workYear?.year)).toEqual([
        1999, 2005, 2020
      ]);
    });

    it("leaves members sharing a part number in the order the API gave them", () => {
      const sorted = sortSeriesMembers([
        member("Del 1", 2016),
        member("Del 1", null),
        member("Del 1", 2001)
      ]);

      expect(sorted.map((m) => m.work.workYear?.year)).toEqual([
        2016,
        undefined,
        2001
      ]);
    });

    it("puts a member with neither part number nor year last of all", () => {
      const sorted = sortSeriesMembers([
        member(null, null),
        member(null, 2001),
        member("Del 1", null)
      ]);

      expect(
        sorted.map((m) => [m.numberInSeries, m.work.workYear?.year])
      ).toEqual([
        ["Del 1", undefined],
        [null, 2001],
        [null, undefined]
      ]);
    });

    it("does not mutate the array it is given", () => {
      const input = [member("Del 2"), member("Del 1")];
      const before = input.map((m) => m.numberInSeries);

      sortSeriesMembers(input);

      expect(input.map((m) => m.numberInSeries)).toEqual(before);
    });
  });
}
