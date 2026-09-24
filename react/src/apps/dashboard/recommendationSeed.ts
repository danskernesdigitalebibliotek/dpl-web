import { sample } from "lodash";
import { FaustId, WorkId } from "../../core/utils/types/ids";
import { ListType } from "../../core/utils/types/list-type";

/** Which of the patron's lists a recommendation seed was taken from. */
export type RecommendationOrigin = "loan" | "reservation" | "favorite";

/**
 * The material a dashboard recommendation is based on. Physical loans and
 * reservations carry a faust, digital ones an ISBN, and favorites a work id.
 * The origin is what the recommendations heading is phrased after.
 */
export type RecommendationSeed =
  | { type: "faust"; faust: FaustId; origin: RecommendationOrigin }
  | { type: "isbn"; isbn: string; origin: RecommendationOrigin }
  | { type: "work-id"; workId: WorkId; origin: RecommendationOrigin };

/**
 * Turns a loan or reservation into a seed, or null when it carries no usable
 * identifier.
 */
export const listItemToRecommendationSeed = (options: {
  item: ListType;
  origin: RecommendationOrigin;
}): RecommendationSeed | null => {
  const { item: listItem, origin } = options;

  if (listItem.identifier) {
    return { origin, type: "isbn", isbn: listItem.identifier };
  }

  if (listItem.faust) {
    return { origin, type: "faust", faust: listItem.faust };
  }

  return null;
};

export const workIdToRecommendationSeed = (options: {
  workId: WorkId;
  origin: RecommendationOrigin;
}): RecommendationSeed => {
  const { workId, origin } = options;

  return { origin, type: "work-id", workId };
};

/**
 * Picks the material to base recommendations on: a random loan, else a random
 * reservation, else a random favorite. Null when every list is empty.
 */
export const pickRecommendationSeed = ({
  loans,
  reservations,
  favorites
}: {
  loans: RecommendationSeed[];
  reservations: RecommendationSeed[];
  favorites: RecommendationSeed[];
}): RecommendationSeed | null =>
  sample(loans) ?? sample(reservations) ?? sample(favorites) ?? null;
