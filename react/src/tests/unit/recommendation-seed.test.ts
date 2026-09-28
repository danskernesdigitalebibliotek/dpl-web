import { describe, expect, it } from "vitest";
import {
  RecommendationSeed,
  listItemToRecommendationSeed,
  pickRecommendationSeed
} from "../../apps/dashboard/recommendationSeed";

const faustSource = (faust: string): RecommendationSeed => ({
  type: "faust",
  faust
});
const workIdSource: RecommendationSeed = {
  type: "work-id",
  workId: "work-of:870970-basis:12345678"
};

describe("listItemToRecommendationSeed", () => {
  it("uses the ISBN of a digital item rather than its faust", () => {
    expect(
      listItemToRecommendationSeed({
        identifier: "9788700000000",
        faust: "11111111"
      })
    ).toEqual({ type: "isbn", isbn: "9788700000000" });
  });

  it("uses the faust of a physical item", () => {
    expect(listItemToRecommendationSeed({ faust: "11111111" })).toEqual(
      faustSource("11111111")
    );
  });

  it("returns null for an item without a usable identifier", () => {
    expect(listItemToRecommendationSeed({})).toBeNull();
  });
});

describe("pickRecommendationSeed", () => {
  it("prefers a loan over reservations and favorites", () => {
    const source = pickRecommendationSeed({
      loans: [faustSource("11111111")],
      reservations: [faustSource("22222222")],
      favorites: [workIdSource]
    });

    expect(source).toEqual(faustSource("11111111"));
  });

  it("falls back to a reservation when there are no loans", () => {
    const source = pickRecommendationSeed({
      loans: [],
      reservations: [faustSource("22222222")],
      favorites: [workIdSource]
    });

    expect(source).toEqual(faustSource("22222222"));
  });

  it("falls back to a favorite when there are no loans or reservations", () => {
    const source = pickRecommendationSeed({
      loans: [],
      reservations: [],
      favorites: [workIdSource]
    });

    expect(source).toEqual(workIdSource);
  });

  it("returns null when every list is empty", () => {
    expect(
      pickRecommendationSeed({ loans: [], reservations: [], favorites: [] })
    ).toBeNull();
  });
});
