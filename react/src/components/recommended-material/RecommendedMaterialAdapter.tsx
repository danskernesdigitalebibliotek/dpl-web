import * as React from "react";
import { getManifestationBasedOnType } from "../../apps/material/helper";
import RecommendedMaterialSkeleton from "./RecommendedMaterialSkeleton";
import RecommendedMaterial from "./recommended-material";
import { filterNonNullManifestations, getCoverUrl } from "../cover/helper";
import {
  useGetCoversByPidsQuery,
  useGetMaterialQuery
} from "../../core/dbc-gateway/generated/graphql";
import {
  creatorsToString,
  flattenCreators
} from "../../core/utils/helpers/general";
import { constructMaterialUrl } from "../../core/utils/helpers/url";
import { useText } from "../../core/utils/text";
import useAddToFavourites from "../../core/utils/useAddToFavourites";
import { Work } from "../../core/utils/types/entities";
import { WorkId } from "../../core/utils/types/ids";
import { ManifestationMaterialType } from "../../core/utils/types/material-type";
import { useUrls } from "../../core/utils/url";

export type RecommendedMaterialAdapterProps = {
  wid: WorkId;
  materialType?: ManifestationMaterialType;
  partOfGrid?: boolean;
};

// Fetches the material data for a single work id and renders the
// presentational RecommendedMaterial. Use this when all you have is a work
// id; components that already hold the material data should render
// RecommendedMaterial directly.
const RecommendedMaterialAdapter: React.FC<RecommendedMaterialAdapterProps> = ({
  wid,
  materialType,
  partOfGrid = false
}) => {
  const t = useText();
  const u = useUrls();
  const materialUrl = u("materialUrl");
  const addToFavourites = useAddToFavourites();

  const { data, isLoading } = useGetMaterialQuery({
    wid
  });

  const work = data?.work as Work | undefined;
  const manifestationForDisplay = work
    ? materialType
      ? getManifestationBasedOnType(work, materialType)
      : work.manifestations.bestRepresentation
    : undefined;

  const { data: coverResult } = useGetCoversByPidsQuery(
    { pids: [manifestationForDisplay?.pid ?? ""] },
    { enabled: !!manifestationForDisplay }
  );

  if (isLoading || !work) {
    return <RecommendedMaterialSkeleton partOfGrid={partOfGrid} />;
  }

  const coverUrl = getCoverUrl({
    coverData: filterNonNullManifestations(coverResult?.manifestations),
    size: "large"
  });

  const author = creatorsToString(flattenCreators(work.creators), t);
  const materialFullUrl = constructMaterialUrl(materialUrl, wid, materialType);

  return (
    <RecommendedMaterial
      wid={wid}
      title={String(work.titles.full)}
      author={author}
      coverUrl={coverUrl}
      url={materialFullUrl}
      partOfGrid={partOfGrid}
      onAddToFavourites={addToFavourites}
    />
  );
};
export default RecommendedMaterialAdapter;
