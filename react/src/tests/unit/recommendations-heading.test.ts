import { describe, expect, it } from "vitest";
import { getRecommendationsHeading } from "../../apps/dashboard/recommendationsHeading";
import { RecommendationSource } from "../../apps/dashboard/recommendations.types";
import { UseTextFunction } from "../../core/utils/text";

// Echoes the key with its placeholders applied, so a test can see both which
// text was picked and what was put into it.
const t: UseTextFunction = (key, options) =>
  Object.entries(options?.placeholders ?? {}).reduce(
    (text, [placeholder, value]) => `${text} ${placeholder}=${value}`,
    key
  );

const source = (
  origin: RecommendationSource["origin"],
  title: string | null = "Ronja Røverdatter"
): RecommendationSource => ({
  origin,
  workId: "work-of:870970-basis:12345678",
  title
});

describe("getRecommendationsHeading", () => {
  it("phrases the heading after a loan", () => {
    expect(getRecommendationsHeading(source("loan"), t)).toBe(
      "dashboardRecommendationsLoanHeadingText @title=Ronja Røverdatter"
    );
  });

  it("phrases the heading after a reservation", () => {
    expect(getRecommendationsHeading(source("reservation"), t)).toBe(
      "dashboardRecommendationsReservationHeadingText @title=Ronja Røverdatter"
    );
  });

  it("phrases the heading after a favorite", () => {
    expect(getRecommendationsHeading(source("favorite"), t)).toBe(
      "dashboardRecommendationsFavoriteHeadingText @title=Ronja Røverdatter"
    );
  });

  it("falls back to the generic heading when the source has no title", () => {
    expect(getRecommendationsHeading(source("loan", null), t)).toBe(
      "dashboardRecommendationsHeadingText"
    );
  });
});
