import * as React from "react";
import RecommendedMaterialAdapter from "../../components/recommended-material/RecommendedMaterialAdapter";
import { WorkId } from "../../core/utils/types/ids";
import { ManifestationMaterialType } from "../../core/utils/types/material-type";

export type RecommendedMaterialProps = {
  wid: WorkId;
  materialType?: ManifestationMaterialType;
  partOfGrid?: boolean;
};

const RecommendedMaterial: React.FC<RecommendedMaterialProps> = ({
  wid,
  materialType,
  partOfGrid = false
}) => {
  return (
    <RecommendedMaterialAdapter
      wid={wid}
      materialType={materialType}
      partOfGrid={partOfGrid}
    />
  );
};
export default RecommendedMaterial;
