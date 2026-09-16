import { FaustId, WorkId } from "../../core/utils/types/ids";

/**
 * The material a dashboard recommendation is based on. Physical loans and
 * reservations carry a faust, digital ones an ISBN, and favorites a work id.
 */
export type RecommendationSource =
  | { type: "faust"; faust: FaustId }
  | { type: "isbn"; isbn: string }
  | { type: "work-id"; workId: WorkId };
