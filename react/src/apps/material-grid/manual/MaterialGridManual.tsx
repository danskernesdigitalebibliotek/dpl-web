import * as React from "react";
import MaterialGrid from "../../../components/material-grid/MaterialGrid";
import MaterialGridSkeleton from "../../../components/material-grid/MaterialGridSkeleton";
import { mapWorkToMaterialGridItem } from "../../../components/material-grid/helper";
import { useMaterialGridWorksByIdsQuery } from "../../../core/dbc-gateway/generated/graphql";
import { useText } from "../../../core/utils/text";
import { useUrls } from "../../../core/utils/url";
import useAddToFavourites from "../../../core/utils/useAddToFavourites";
import { WorkId } from "../../../core/utils/types/ids";
import { ManifestationMaterialType } from "../../../core/utils/types/material-type";

// The editor-picked references arriving from the CMS via the app's
// `materials` data attribute: a work id, optionally pinned to a specific
// material type (e.g. the audiobook edition).
export type MaterialGridManualMaterial = {
  wid: WorkId;
  materialType?: ManifestationMaterialType;
};

export type MaterialGridManualProps = {
  materials: MaterialGridManualMaterial[];
  title?: string;
  description?: string;
};

const MaterialGridManual: React.FC<MaterialGridManualProps> = ({
  materials,
  title,
  description
}) => {
  const t = useText();
  const u = useUrls();
  const materialUrl = u("materialUrl");
  const addToFavourites = useAddToFavourites();
  const buttonText = t("buttonText");

  const { data, isLoading } = useMaterialGridWorksByIdsQuery(
    { ids: materials.map(({ wid }) => wid) },
    { enabled: materials.length > 0 }
  );

  if (isLoading) {
    return <MaterialGridSkeleton title={title} />;
  }

  // Keep the editor-defined order: map the incoming references to the
  // fetched works, dropping references the gateway could not resolve.
  const worksById = new Map(
    (data?.works ?? [])
      .filter((work) => work !== null)
      .map((work) => [work.workId, work])
  );
  const gridMaterials = materials.flatMap(({ wid, materialType }) => {
    const work = worksById.get(wid);
    return work
      ? [mapWorkToMaterialGridItem(work, { t, materialUrl, materialType })]
      : [];
  });

  return (
    <MaterialGrid
      title={title}
      description={description}
      materials={gridMaterials}
      buttonText={buttonText}
      onAddToFavourites={addToFavourites}
    />
  );
};
export default MaterialGridManual;
