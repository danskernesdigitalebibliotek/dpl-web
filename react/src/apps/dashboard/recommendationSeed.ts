import { sample } from "lodash";
import { FaustId, WorkId } from "../../core/utils/types/ids";
import { ListType } from "../../core/utils/types/list-type";

/**
 * The material a dashboard recommendation is based on. Physical loans and
 * reservations carry a faust, digital ones an ISBN, and favorites a work id.
 */
export type RecommendationSeed =
  | { type: "faust"; faust: FaustId }
  | { type: "isbn"; isbn: string }
  | { type: "work-id"; workId: WorkId };

/**
 * Turns a loan or reservation into a seed, or null when it carries no usable
 * identifier.
 */
export const listItemToRecommendationSeed = (
  listItem: ListType
): RecommendationSeed | null => {
  if (listItem.identifier) {
    return { type: "isbn", isbn: listItem.identifier };
  }

  if (listItem.faust) {
    return { type: "faust", faust: listItem.faust };
  }

  return null;
};

export const workIdToRecommendationSeed = (
  workId: WorkId
): RecommendationSeed => {
  return { type: "work-id", workId };
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
