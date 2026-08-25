import * as React from "react";
import MaterialGrid from "../../../components/material-grid/MaterialGrid";
import MaterialGridSkeleton from "../../../components/material-grid/MaterialGridSkeleton";
import {
  CsHoldingsStatusEnum,
  useMaterialGridComplexSearchQuery
} from "../../../core/dbc-gateway/generated/graphql";
import { mapWorkToMaterialGridItem } from "../../../components/material-grid/helper";
import useGetSearchBranches from "../../../core/utils/branches";
import {
  useGetPhysicalHoldingsFilters,
  hasActivePhysicalHoldingsFilter
} from "../../../core/utils/useGetPhysicalHoldingsFilters";
import { useText } from "../../../core/utils/text";
import { useUrls } from "../../../core/utils/url";
import useAddToFavourites from "../../../core/utils/useAddToFavourites";
import { commaSeparatedStringToArray } from "../../advanced-search/helpers";
import {
  advancedSortMap,
  AdvancedSortMapStrings
} from "../../advanced-search/types";
export type MaterialGridAutomaticProps = {
  cql: string;
  title?: string;
  description?: string;
  requestedAmount: number;
  location?: string;
  sublocation?: string;
  branch?: string;
  department?: string;
  onshelf?: boolean;
  sort?: string;
  firstaccessiondateitem?: string;
};

const MaterialGridAutomatic: React.FC<MaterialGridAutomaticProps> = ({
  cql,
  location,
  sublocation,
  branch,
  department,
  onshelf,
  sort,
  title,
  description,
  requestedAmount,
  firstaccessiondateitem
}) => {
  const t = useText();
  const u = useUrls();
  const materialUrl = u("materialUrl");
  const addToFavourites = useAddToFavourites();
  const buttonText = t("buttonText");
  const cleanBranches = useGetSearchBranches();
  const physicalHoldingsFilters = useGetPhysicalHoldingsFilters();

  // When the editor filters on physical holdings we must also exclude online
  // editions and restrict to the site's own agency, so the grid only shows the
  // library's own physical materials.
  const hasPhysicalHoldingsFilter = hasActivePhysicalHoldingsFilter({
    onShelf: onshelf,
    branch,
    department,
    location,
    sublocation
  });

  const { data, isLoading } = useMaterialGridComplexSearchQuery({
    cql,
    offset: 0,
    limit: requestedAmount,
    filters: {
      branchId: cleanBranches,
      ...(location ? { location: commaSeparatedStringToArray(location) } : {}),
      ...(sublocation
        ? { sublocation: commaSeparatedStringToArray(sublocation) }
        : {}),
      ...(branch ? { branch: commaSeparatedStringToArray(branch) } : {}),
      ...(department
        ? { department: commaSeparatedStringToArray(department) }
        : {}),
      ...(onshelf ? { status: [CsHoldingsStatusEnum.Onshelf] } : {}),
      ...(firstaccessiondateitem
        ? { firstAccessionDate: decodeURIComponent(firstaccessiondateitem) }
        : {}),
      ...(hasPhysicalHoldingsFilter ? physicalHoldingsFilters : {})
    },
    ...(sort ? { sort: advancedSortMap[sort as AdvancedSortMapStrings] } : {})
  });

  if (isLoading || !data) {
    return <MaterialGridSkeleton title={title} />;
  }

  const resultWorks = data.complexSearch.works;
  const materials = resultWorks.map((work) =>
    mapWorkToMaterialGridItem(work, { t, materialUrl })
  );

  return (
    <MaterialGrid
      title={title}
      materials={materials}
      description={description}
      buttonText={buttonText}
      onAddToFavourites={addToFavourites}
    />
  );
};
export default MaterialGridAutomatic;
