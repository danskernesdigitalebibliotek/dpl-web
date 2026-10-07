import { shuffle } from "lodash";
import { hasValue } from "../../core/utils/helpers/has-value";
import { FaustId, WorkId } from "../../core/utils/types/ids";
import { ListType } from "../../core/utils/types/list-type";
import { RecommendationOrigin } from "./recommendations.types";

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
export const listItemToRecommendationSeed = (
  listItem: ListType,
  origin: RecommendationOrigin
): RecommendationSeed | null => {
  if (listItem.identifier) {
    return { origin, type: "isbn", isbn: listItem.identifier };
  }

  if (listItem.faust) {
    return { origin, type: "faust", faust: listItem.faust };
  }

  return null;
};

/**
 * Turns a list of loans or reservations into seeds, dropping unusable items.
 */
export const listItemsToRecommendationSeeds = (
  listItems: ListType[],
  origin: RecommendationOrigin
): RecommendationSeed[] =>
  listItems
    .map((listItem) => listItemToRecommendationSeed(listItem, origin))
    .filter(hasValue);

/** Turns the patron's favorites, which are stored as work ids, into seeds. */
export const workIdsToRecommendationSeeds = (
  workIds: WorkId[]
): RecommendationSeed[] =>
  workIds.map((workId) => ({ origin: "favorite", type: "work-id", workId }));

/**
 * Orders the materials to base recommendations on.
 *
 * The loans in random order, then the reservations, then the favorites.
 */
export const orderRecommendationSeeds = ({
  loans,
  reservations,
  favorites
}: {
  loans: RecommendationSeed[];
  reservations: RecommendationSeed[];
  favorites: RecommendationSeed[];
}): RecommendationSeed[] => [
  ...shuffle(loans),
  ...shuffle(reservations),
  ...shuffle(favorites)
];
