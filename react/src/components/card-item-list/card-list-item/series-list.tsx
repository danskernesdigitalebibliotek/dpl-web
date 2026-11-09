import React from "react";
import HorizontalTermLine from "../../horizontal-term-line/HorizontalTermLine";
import {
  constructSearchUrl,
  constructSeriesUrl
} from "../../../core/utils/helpers/url";
import { UseTextFunction } from "../../../core/utils/text";

type SeriesListEntry = {
  title: string;
  seriesId?: string | null;
  numberInSeries?: string | null;
};

type SeriesListProps = {
  series: SeriesListEntry[];
  searchUrl: URL;
  seriesUrl: URL;
  t: UseTextFunction;
  dataCy?: string;
};

const SeriesList = ({
  series,
  searchUrl,
  seriesUrl,
  t,
  dataCy = "series-list"
}: SeriesListProps) => {
  return (
    <>
      {series.map(({ title, seriesId, numberInSeries }, index) => {
        // seriesId is nullable, and without one there is no landing page to
        // point at, so those series keep linking to a search for the title.
        const url = seriesId
          ? constructSeriesUrl(seriesUrl, seriesId)
          : constructSearchUrl(searchUrl, title);

        return (
          <HorizontalTermLine
            key={index}
            title={numberInSeries || t("partOfSeriesText")}
            subTitle={numberInSeries ? t("inSeriesText") : undefined}
            linkList={[{ url, term: title }]}
            dataCy={`${dataCy}-${index}`}
          />
        );
      })}
    </>
  );
};

export default SeriesList;
