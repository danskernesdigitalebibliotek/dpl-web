import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import {
  getAvailablePriorityMaterialType,
  getManifestationBasedOnType
} from "../../apps/material/helper";
import RecommendedMaterialSkeleton from "./RecommendedMaterialSkeleton";
import ButtonFavourite, {
  ButtonFavouriteId
} from "../../components/button-favourite/button-favourite";
import { Cover } from "../../components/cover/cover";
import { useGetMaterialQuery } from "../../core/dbc-gateway/generated/graphql";
import { guardedRequest } from "../../core/guardedRequests.slice";
import { TypedDispatch } from "../../core/store";
import {
  creatorsToString,
  flattenCreators
} from "../../core/utils/helpers/general";
import { constructMaterialUrl } from "../../core/utils/helpers/url";
import { useText } from "../../core/utils/text";
import { Work } from "../../core/utils/types/entities";
import { WorkId } from "../../core/utils/types/ids";
import { ManifestationMaterialType } from "../../core/utils/types/material-type";
import { useUrls } from "../../core/utils/url";
import { useEventStatistics } from "../../core/statistics/useStatistics";
import { statistics } from "../../core/statistics/statistics";
import { StaticRecommendedMaterial } from "./static-recommended-material";

export type RecommendedMaterialProps = {
  wid: WorkId;
  materialType?: ManifestationMaterialType;
  partOfGrid?: boolean;
};

const RecommendedMaterialComp: React.FC<RecommendedMaterialProps> = ({
  wid,
  materialType,
  partOfGrid = false
}) => {
  const t = useText();
  const u = useUrls();
  const { track } = useEventStatistics();
  const materialUrl = u("materialUrl");
  const dispatch = useDispatch<TypedDispatch>();
  const queryClient = useQueryClient();

  const { data, isLoading } = useGetMaterialQuery({
    wid
  });

  if (isLoading || !data?.work) {
    return <RecommendedMaterialSkeleton partOfGrid={partOfGrid} />;
  }

  const {
    work: {
      titles: { full: fullTitle },
      creators
    }
  } = data;

  const work = data.work as Work;
  const materialManifestationForDisplay = materialType
    ? getManifestationBasedOnType(work, materialType)
    : work.manifestations.bestRepresentation;

  const { pid } = materialManifestationForDisplay;

  const author = creatorsToString(flattenCreators(creators), t);

  // Only add the type to the URL when the work actually has it; otherwise let
  // the work page apply its normal logic. Reuse the manifestation already
  // resolved for display instead of resolving it a second time.
  const urlMaterialType = getAvailablePriorityMaterialType(
    materialManifestationForDisplay,
    materialType
  );
  const materialFullUrl = constructMaterialUrl(
    materialUrl,
    wid,
    urlMaterialType
  );
  const addToListRequest = (id: ButtonFavouriteId) => {
    dispatch(
      guardedRequest({
        type: "addFavorite",
        args: { id, queryClient },
        app: "material"
      })
    );
  };

  // Materials shown in a grid are tracked as their own Mapp event so DDF can
  // compare grid-formidling against other ways of presenting materials.
  const clickStatistics = partOfGrid
    ? statistics.materialGridClick
    : statistics.recommendedMaterial;

  const trackData = () =>
    track("click", {
      id: clickStatistics.id,
      name: clickStatistics.name,
      trackedData: wid
    });

  return (
    <StaticRecommendedMaterial
      title={fullTitle.join(", ")}
      author={author}
      isPartOfGrid={partOfGrid}
      linkProps={{
        href: materialFullUrl,
        trackClick: trackData
      }}
      cover={
        <Cover
          ids={[pid]}
          url={materialFullUrl}
          size="large"
          animate
          alt=""
          shadow="medium"
          trackClick={trackData}
        />
      }
      favoriteButton={
        <ButtonFavourite
          title={String(fullTitle)}
          id={wid}
          addToListRequest={addToListRequest}
        />
      }
    />
  );
};
export default RecommendedMaterialComp;
