import { describe, expect, it } from "vitest";
import {
  RecommendationSeed,
  listItemToRecommendationSeed,
  listItemsToRecommendationSeeds,
  pickRecommendationSeed,
  workIdsToRecommendationSeeds
} from "../../apps/dashboard/recommendationSeed";

const loanSeed = (faust: string): RecommendationSeed => ({
  origin: "loan",
  type: "faust",
  faust
});
const reservationSeed = (faust: string): RecommendationSeed => ({
  origin: "reservation",
  type: "faust",
  faust
});
const favoriteSeed: RecommendationSeed = {
  origin: "favorite",
  type: "work-id",
  workId: "work-of:870970-basis:12345678"
};

describe("listItemToRecommendationSeed", () => {
  it("uses the ISBN of a digital item rather than its faust", () => {
    expect(
      listItemToRecommendationSeed(
        { identifier: "9788700000000", faust: "11111111" },
        "loan"
      )
    ).toEqual({ origin: "loan", type: "isbn", isbn: "9788700000000" });
  });

  it("uses the faust of a physical item", () => {
    expect(
      listItemToRecommendationSeed({ faust: "11111111" }, "reservation")
    ).toEqual(reservationSeed("11111111"));
  });

  it("returns null for an item without a usable identifier", () => {
    expect(listItemToRecommendationSeed({}, "loan")).toBeNull();
  });
});

describe("listItemsToRecommendationSeeds", () => {
  it("tags every seed with the origin and drops unusable items", () => {
    expect(
      listItemsToRecommendationSeeds(
        [{ faust: "11111111" }, {}, { faust: "22222222" }],
        "loan"
      )
    ).toEqual([loanSeed("11111111"), loanSeed("22222222")]);
  });
});

describe("workIdsToRecommendationSeeds", () => {
  it("tags every work id as a favorite", () => {
    expect(
      workIdsToRecommendationSeeds(["work-of:870970-basis:12345678"])
    ).toEqual([favoriteSeed]);
  });
});

describe("pickRecommendationSeed", () => {
  it("prefers a loan over reservations and favorites", () => {
    const seed = pickRecommendationSeed({
      loans: [loanSeed("11111111")],
      reservations: [reservationSeed("22222222")],
      favorites: [favoriteSeed]
    });

    expect(seed).toEqual(loanSeed("11111111"));
  });

  it("falls back to a reservation when there are no loans", () => {
    const seed = pickRecommendationSeed({
      loans: [],
      reservations: [reservationSeed("22222222")],
      favorites: [favoriteSeed]
    });

    expect(seed).toEqual(reservationSeed("22222222"));
  });

  it("falls back to a favorite when there are no loans or reservations", () => {
    const seed = pickRecommendationSeed({
      loans: [],
      reservations: [],
      favorites: [favoriteSeed]
    });

    expect(seed).toEqual(favoriteSeed);
  });

  it("returns null when every list is empty", () => {
    expect(
      pickRecommendationSeed({ loans: [], reservations: [], favorites: [] })
    ).toBeNull();
  });
});
