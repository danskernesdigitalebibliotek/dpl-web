import * as React from "react";
import MaterialGrid from "../../../components/material-grid/MaterialGrid";
import MaterialGridSkeleton from "../../../components/material-grid/MaterialGridSkeleton";
import {
  CsHoldingsStatusEnum,
  useMaterialGridComplexSearchQuery
} from "../../../core/dbc-gateway/generated/graphql";
import { mapWorkToMaterialGridItem } from "../../../components/material-grid/helper";
import useGetSearchBranches from "../../../core/utils/branches";
import { getQueryParams } from "../../../core/utils/helpers/url";
import { useText } from "../../../core/utils/text";
import { useUrls } from "../../../core/utils/url";
import useAddToFavourites from "../../../core/utils/useAddToFavourites";
import { commaSeparatedStringToArray } from "../../advanced-search/helpers";
import {
  advancedSortMap,
  AdvancedSortMapStrings
} from "../../advanced-search/types";

export type MaterialGridLinkAutomaticProps = {
  link: URL;
  title?: string;
  description?: string;
  requestedAmount: number;
};

const MaterialGridLinkAutomatic: React.FC<MaterialGridLinkAutomaticProps> = ({
  link,
  title,
  description,
  requestedAmount
}) => {
  const t = useText();
  const u = useUrls();
  const materialUrl = u("materialUrl");
  const addToFavourites = useAddToFavourites();
  const buttonText = t("buttonText");
  const cleanBranches = useGetSearchBranches();
  const { advancedSearchCql, location, sublocation, onshelf, sort } =
    getQueryParams(link);

  const { data, isLoading } = useMaterialGridComplexSearchQuery(
    {
      cql: advancedSearchCql,
      offset: 0,
      limit: requestedAmount,
      filters: {
        branchId: cleanBranches,
        ...(location
          ? { location: commaSeparatedStringToArray(location) }
          : {}),
        ...(sublocation
          ? { sublocation: commaSeparatedStringToArray(sublocation) }
          : {}),
        ...(onshelf === "true"
          ? { status: [CsHoldingsStatusEnum.Onshelf] }
          : {})
      },
      ...(sort ? { sort: advancedSortMap[sort as AdvancedSortMapStrings] } : {})
    },
    {
      enabled: !!advancedSearchCql
    }
  );

  if (isLoading || !data) {
    return <MaterialGridSkeleton title={title} />;
  }

  const resultWorks = data.complexSearch.works;
  const materials = resultWorks.map((work) =>
    mapWorkToMaterialGridItem(work, { t, materialUrl })
  );

  return (
    <>
      <MaterialGrid
        title={title}
        materials={materials}
        description={description}
        buttonText={buttonText}
        onAddToFavourites={addToFavourites}
      />
    </>
  );
};
export default MaterialGridLinkAutomatic;
