import { describe, expect, it } from "vitest";
import {
  RecommendationSource,
  listItemToRecommendationSource,
  pickRecommendationSource
} from "../../apps/dashboard/recommendationSource";

const loanSource = (faust: string): RecommendationSource => ({
  origin: "loan",
  type: "faust",
  faust
});
const reservationSource = (faust: string): RecommendationSource => ({
  origin: "reservation",
  type: "faust",
  faust
});
const favoriteSource: RecommendationSource = {
  origin: "favorite",
  type: "work-id",
  workId: "work-of:870970-basis:12345678"
};

describe("listItemToRecommendationSource", () => {
  it("uses the ISBN of a digital item rather than its faust", () => {
    expect(
      listItemToRecommendationSource({
        item: { identifier: "9788700000000", faust: "11111111" },
        origin: "loan"
      })
    ).toEqual({ origin: "loan", type: "isbn", isbn: "9788700000000" });
  });

  it("uses the faust of a physical item", () => {
    expect(
      listItemToRecommendationSource({
        item: { faust: "11111111" },
        origin: "reservation"
      })
    ).toEqual(reservationSource("11111111"));
  });

  it("returns null for an item without a usable identifier", () => {
    expect(
      listItemToRecommendationSource({ item: {}, origin: "loan" })
    ).toBeNull();
  });
});

describe("pickRecommendationSource", () => {
  it("prefers a loan over reservations and favorites", () => {
    const source = pickRecommendationSource({
      loans: [loanSource("11111111")],
      reservations: [reservationSource("22222222")],
      favorites: [favoriteSource]
    });

    expect(source).toEqual(loanSource("11111111"));
  });

  it("falls back to a reservation when there are no loans", () => {
    const source = pickRecommendationSource({
      loans: [],
      reservations: [reservationSource("22222222")],
      favorites: [favoriteSource]
    });

    expect(source).toEqual(reservationSource("22222222"));
  });

  it("falls back to a favorite when there are no loans or reservations", () => {
    const source = pickRecommendationSource({
      loans: [],
      reservations: [],
      favorites: [favoriteSource]
    });

    expect(source).toEqual(favoriteSource);
  });

  it("returns null when every list is empty", () => {
    expect(
      pickRecommendationSource({ loans: [], reservations: [], favorites: [] })
    ).toBeNull();
  });
});
