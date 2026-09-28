import { describe, expect, it } from "vitest";
import {
  RecommendationSource,
  listItemToRecommendationSource,
  pickRecommendationSource
} from "../../apps/dashboard/recommendationSource";

const faustSource = (faust: string): RecommendationSource => ({
  type: "faust",
  faust
});
const workIdSource: RecommendationSource = {
  type: "work-id",
  workId: "work-of:870970-basis:12345678"
};

describe("listItemToRecommendationSource", () => {
  it("uses the ISBN of a digital item rather than its faust", () => {
    expect(
      listItemToRecommendationSource({
        identifier: "9788700000000",
        faust: "11111111"
      })
    ).toEqual({ type: "isbn", isbn: "9788700000000" });
  });

  it("uses the faust of a physical item", () => {
    expect(listItemToRecommendationSource({ faust: "11111111" })).toEqual(
      faustSource("11111111")
    );
  });

  it("returns null for an item without a usable identifier", () => {
    expect(listItemToRecommendationSource({})).toBeNull();
  });
});

describe("pickRecommendationSource", () => {
  it("prefers a loan over reservations and favorites", () => {
    const source = pickRecommendationSource({
      loans: [faustSource("11111111")],
      reservations: [faustSource("22222222")],
      favorites: [workIdSource]
    });

    expect(source).toEqual(faustSource("11111111"));
  });

  it("falls back to a reservation when there are no loans", () => {
    const source = pickRecommendationSource({
      loans: [],
      reservations: [faustSource("22222222")],
      favorites: [workIdSource]
    });

    expect(source).toEqual(faustSource("22222222"));
  });

  it("falls back to a favorite when there are no loans or reservations", () => {
    const source = pickRecommendationSource({
      loans: [],
      reservations: [],
      favorites: [workIdSource]
    });

    expect(source).toEqual(workIdSource);
  });

  it("returns null when every list is empty", () => {
    expect(
      pickRecommendationSource({ loans: [], reservations: [], favorites: [] })
    ).toBeNull();
  });
});
