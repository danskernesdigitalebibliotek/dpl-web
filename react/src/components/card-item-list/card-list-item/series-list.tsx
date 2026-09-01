import React from "react";
import { Work } from "../../../core/utils/types/entities";
import { getNumberInSeries } from "../helper";
import HorizontalTermLine from "../../horizontal-term-line/HorizontalTermLine";
import {
  constructSearchUrl,
  constructSeriesUrl
} from "../../../core/utils/helpers/url";
import { UseTextFunction } from "../../../core/utils/text";

type SeriesListProps = {
  series: Work["series"];
  workId: Work["workId"];
  searchUrl: URL;
  seriesUrl: URL;
  t: UseTextFunction;
  dataCy?: string;
};

const SeriesList = ({
  series,
  workId,
  searchUrl,
  seriesUrl,
  t,
  dataCy = "series-list"
}: SeriesListProps) => {
  return (
    <>
      {series.map((serie, index) => {
        const numberInSeries = getNumberInSeries(serie, workId);

        if (!numberInSeries) {
          return null;
        }

        // seriesId is nullable, and without one there is no landing page to
        // point at, so those series keep linking to a search for the title.
        const url = serie.seriesId
          ? constructSeriesUrl(seriesUrl, serie.seriesId)
          : constructSearchUrl(searchUrl, serie.title);

        return (
          <HorizontalTermLine
            key={index}
            title={numberInSeries}
            subTitle={t("inSeriesText")}
            linkList={[{ url, term: serie.title }]}
            dataCy={`${dataCy}-${index}`}
          />
        );
      })}
    </>
  );
};

export default SeriesList;
