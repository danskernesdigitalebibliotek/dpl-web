import { sample } from "lodash";
import { FaustId, WorkId } from "../../core/utils/types/ids";
import { ListType } from "../../core/utils/types/list-type";

/** Which of the patron's lists a recommendation source was taken from. */
export type RecommendationOrigin = "loan" | "reservation" | "favorite";

/**
 * The material a dashboard recommendation is based on. Physical loans and
 * reservations carry a faust, digital ones an ISBN, and favorites a work id.
 * The origin is what the recommendations heading is phrased after.
 */
export type RecommendationSource =
  | { type: "faust"; faust: FaustId; origin: RecommendationOrigin }
  | { type: "isbn"; isbn: string; origin: RecommendationOrigin }
  | { type: "work-id"; workId: WorkId; origin: RecommendationOrigin };

/**
 * Turns a loan or reservation into a source, or null when it carries no usable
 * identifier.
 */
export const listItemToRecommendationSource = (options: {
  item: ListType;
  origin: RecommendationOrigin;
}): RecommendationSource | null => {
  const { item: listItem, origin } = options;

  if (listItem.identifier) {
    return { origin, type: "isbn", isbn: listItem.identifier };
  }

  if (listItem.faust) {
    return { origin, type: "faust", faust: listItem.faust };
  }

  return null;
};

export const workIdToRecommendationSource = (options: {
  workId: WorkId;
  origin: RecommendationOrigin;
}): RecommendationSource => {
  const { workId, origin } = options;

  return { origin, type: "work-id", workId };
};

/**
 * Picks the material to base recommendations on: a random loan, else a random
 * reservation, else a random favorite. Null when every list is empty.
 */
export const pickRecommendationSource = ({
  loans,
  reservations,
  favorites
}: {
  loans: RecommendationSource[];
  reservations: RecommendationSource[];
  favorites: RecommendationSource[];
}): RecommendationSource | null =>
  sample(loans) ?? sample(reservations) ?? sample(favorites) ?? null;
