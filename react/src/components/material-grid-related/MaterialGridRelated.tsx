import * as React from "react";

import {
  useMaterialGridComplexSearchQuery,
  useMaterialGridRecommendationsQuery
} from "../../core/dbc-gateway/generated/graphql";
import { useText } from "../../core/utils/text";
import { useUrls } from "../../core/utils/url";
import useAddToFavourites from "../../core/utils/useAddToFavourites";
import { Work } from "../../core/utils/types/entities";
import MaterialGrid from "../material-grid/MaterialGrid";
import {
  MaterialGridItem,
  mapWorkToMaterialGridItem
} from "../material-grid/helper";
import MaterialGridSkeleton from "../material-grid/MaterialGridSkeleton";

import { first } from "lodash";
import { FC, useEffect, useMemo, useState } from "react";
import { flattenCreators, getWorkPid } from "../../core/utils/helpers/general";
import {
  extractWorksFromComplexSearch,
  extractWorksFromRecommendations,
  getPreferredFallback,
  prepareCreatorCql
} from "./helper";
import { MaterialGridFilterType } from "./MaterialGridRelated.types";
import { MaterialGridRelatedInlineFilters } from "./MaterialGridRelatedInlineFilters";
import { MaterialGridRelatedSelect } from "./MaterialGridRelatedSelect";

type MaterialGridRelatedOption = {
  label: string;
  value: MaterialGridFilterType;
  materials: MaterialGridItem[];
};

export type MaterialGridRelatedProps = {
  work: Work;
};

const MaterialGridRelated: FC<MaterialGridRelatedProps> = ({ work }) => {
  const t = useText();
  const u = useUrls();
  const materialUrl = u("materialUrl");
  const addToFavourites = useAddToFavourites();
  const title = t("materialGridRelatedTitleText");

  const pid = getWorkPid(work);

  const { creators } = work.manifestations.bestRepresentation;
  const { series } = work;
  const seriesObject = first(series);
  const flattenedCreators = flattenCreators(creators);
  const creatorCqlString = prepareCreatorCql(flattenedCreators);

  const { data: recommendationData, isLoading: recommendationLoading } =
    useMaterialGridRecommendationsQuery(
      {
        pid,
        limit: 8
      },
      { enabled: !!pid }
    );

  const { data: creatorData, isLoading: creatorLoading } =
    useMaterialGridComplexSearchQuery(
      {
        cql: creatorCqlString,
        limit: 8,
        offset: 0,
        filters: {}
      },
      {
        enabled: !!creatorCqlString
      }
    );

  const { data: seriesData, isLoading: seriesLoading } =
    useMaterialGridComplexSearchQuery(
      {
        cql: `term.series='${seriesObject?.title}'`,
        limit: 8,
        offset: 0,
        filters: {}
      },
      { enabled: !!seriesObject?.title }
    );

  const [filter, setFilter] =
    useState<MaterialGridFilterType>("recommendation");

  const allQueriesLoaded =
    !recommendationLoading && !creatorLoading && !seriesLoading;

  const recommendationMaterials = extractWorksFromRecommendations(
    recommendationData
  ).map((recommendedWork) =>
    mapWorkToMaterialGridItem(recommendedWork, { t, materialUrl })
  );
  const seriesMaterials = extractWorksFromComplexSearch(seriesData).map(
    (seriesWork) => mapWorkToMaterialGridItem(seriesWork, { t, materialUrl })
  );
  const authorMaterials = extractWorksFromComplexSearch(creatorData).map(
    (authorWork) => mapWorkToMaterialGridItem(authorWork, { t, materialUrl })
  );

  const options = useMemo<MaterialGridRelatedOption[]>(() => {
    if (!allQueriesLoaded) return [];

    const opts: MaterialGridRelatedOption[] = [];

    if (recommendationMaterials.length) {
      opts.push({
        label: t("materialGridRelatedRecommendationsDataLabelText"),
        value: "recommendation",
        materials: recommendationMaterials
      });
    }

    if (seriesMaterials.length) {
      opts.push({
        label: t("materialGridRelatedSeriesDataLabelText"),
        value: "series",
        materials: seriesMaterials
      });
    }

    if (authorMaterials.length) {
      opts.push({
        label: t("materialGridRelatedAuthorDataLabelText"),
        value: "author",
        materials: authorMaterials
      });
    }

    return opts;
  }, [
    allQueriesLoaded,
    recommendationMaterials,
    seriesMaterials,
    authorMaterials,
    t
  ]);

  useEffect(() => {
    if (
      allQueriesLoaded &&
      !options.some((o) => o.value === filter) &&
      options.length > 0
    ) {
      const fallback = getPreferredFallback(options);
      if (fallback) setFilter(fallback);
    }
  }, [allQueriesLoaded, options, filter]);

  const displayedMaterials =
    options.find((o) => o.value === filter)?.materials ?? [];

  if (!allQueriesLoaded) {
    return <MaterialGridSkeleton title={title} />;
  }

  return (
    <div data-cy="material-grid-related" className="material-grid-related">
      <div className="material-grid-related__header">
        <h2 className="material-grid-related__title">{title}</h2>
        <MaterialGridRelatedSelect
          filter={filter}
          onChange={setFilter}
          options={options.map(({ label, value }) => ({ label, value }))}
        />
        <MaterialGridRelatedInlineFilters
          filter={filter}
          onChange={setFilter}
          options={options.map(({ label, value, materials }) => ({
            label,
            value,
            count: materials.length
          }))}
        />
      </div>
      <MaterialGrid
        materials={displayedMaterials}
        initialMaximumDisplay={8}
        onAddToFavourites={addToFavourites}
      />
    </div>
  );
};

export default MaterialGridRelated;
