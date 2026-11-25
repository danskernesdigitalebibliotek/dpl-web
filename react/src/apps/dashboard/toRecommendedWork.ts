import { DashboardRecommendationWorkFragment } from "../../core/dbc-gateway/generated/graphql";
import { constructMaterialUrl } from "../../core/utils/helpers/url";
import { WorkId } from "../../core/utils/types/ids";
import { RecommendedWork } from "./recommendations.types";

/**
 * The work as a recommendation slider shows it. With a material type, the link
 * opens the material page on that type.
 */
export const toRecommendedWork = (
  work: DashboardRecommendationWorkFragment,
  materialUrl: URL,
  materialType?: string
): RecommendedWork => {
  const workId = work.workId as WorkId;

  return {
    workId,
    title: work.titles.full.join(", "),
    author: work.creators.map((creator) => creator.display).join(", "),
    coverSrc: work.manifestations.bestRepresentation.cover.large?.url ?? null,
    url: constructMaterialUrl(materialUrl, workId, materialType)
  };
};
