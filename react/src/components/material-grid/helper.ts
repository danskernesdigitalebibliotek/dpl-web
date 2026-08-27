import { getManifestationBasedOnType } from "../../apps/material/helper";
import {
  ManifestationForMaterialGridFragment,
  WorkForMaterialGridFragment
} from "../../core/dbc-gateway/generated/graphql";
import { creatorsToString } from "../../core/utils/helpers/general";
import { constructMaterialUrl } from "../../core/utils/helpers/url";
import { UseTextFunction } from "../../core/utils/text";
import { Work } from "../../core/utils/types/entities";
import { WorkId } from "../../core/utils/types/ids";
import { ManifestationMaterialType } from "../../core/utils/types/material-type";

// The render-ready data for one material in a grid. Produced by the grid
// wrappers with mapWorkToMaterialGridItem and consumed by the presentational
// MaterialGrid/RecommendedMaterial components.
export type MaterialGridItem = {
  wid: WorkId;
  title: string;
  author: string;
  coverUrl?: string | null;
  url: URL;
};

const getManifestationForDisplay = (
  work: WorkForMaterialGridFragment,
  materialType?: ManifestationMaterialType
): ManifestationForMaterialGridFragment => {
  if (!materialType) {
    return work.manifestations.bestRepresentation;
  }
  // getManifestationBasedOnType only touches manifestation fields that the
  // WorkForMaterialGrid fragment selects, so the lean fragment can safely
  // stand in for the full Work entity.
  return getManifestationBasedOnType(
    work as unknown as Work,
    materialType
  ) as unknown as ManifestationForMaterialGridFragment;
};

export const mapWorkToMaterialGridItem = (
  work: WorkForMaterialGridFragment,
  {
    t,
    materialUrl,
    materialType
  }: {
    t: UseTextFunction;
    materialUrl: URL;
    materialType?: ManifestationMaterialType;
  }
): MaterialGridItem => {
  const wid = work.workId as WorkId;
  const manifestation = getManifestationForDisplay(work, materialType);

  return {
    wid,
    title: String(work.titles.full),
    author: creatorsToString(
      work.creators.map((creator) => creator.display),
      t
    ),
    coverUrl: manifestation.cover.large?.url ?? null,
    url: constructMaterialUrl(materialUrl, wid, materialType)
  };
};
