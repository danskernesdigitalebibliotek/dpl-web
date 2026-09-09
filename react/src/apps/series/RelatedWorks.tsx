import React from "react";
import { useDispatch } from "react-redux";
import { ButtonFavouriteId } from "../../components/button-favourite/button-favourite";
import MaterialSlider from "../../components/material-slider/MaterialSlider";
import { guardedRequest } from "../../core/guardedRequests.slice";
import { TypedDispatch } from "../../core/store";
import { constructMaterialUrl } from "../../core/utils/helpers/url";
import { useText } from "../../core/utils/text";
import { useUrls } from "../../core/utils/url";
import { parseNumberInSeries } from "./helper";
import { RelatedWork } from "./relatedWorks.types";
import useRelatedWorks, { UseRelatedWorksArgs } from "./useRelatedWorks";

type RelatedWorksProps = UseRelatedWorksArgs;

// "Del 1 i serien Vildheks" / "Bind 1 i serien Kadaverdoktoren" - only for
// works that open one of their series. The API's own label ("Del 1",
// "Bind 1") is reused rather than reformatted.
const getSeriesLabel = (work: RelatedWork): string | undefined => {
  const firstInSeries = work.series.find(
    (series) => parseNumberInSeries(series.numberInSeries) === 1
  );

  if (!firstInSeries) {
    return undefined;
  }

  return `${firstInSeries.numberInSeries} i ${firstInSeries.title}`;
};

// The "other works by this author" section at the bottom of the series page.
//
// Renders nothing when nothing survived filtering: an absent section is the
// designed outcome, not an error state.
const RelatedWorks: React.FC<RelatedWorksProps> = ({
  author,
  currentSeries
}) => {
  const t = useText();
  const u = useUrls();
  const materialUrl = u("materialUrl");
  const dispatch = useDispatch<TypedDispatch>();
  const { works, isLoading } = useRelatedWorks({ author, currentSeries });

  const addToListRequest = (id: ButtonFavouriteId) => {
    dispatch(
      guardedRequest({
        type: "addFavorite",
        args: { id },
        app: "series"
      })
    );
  };

  // The section sits below the member list and is decorative, so it simply
  // appears once loaded rather than holding a placeholder open.
  if (isLoading || works.length === 0) {
    return null;
  }

  return (
    <section className="related-works">
      <MaterialSlider
        heading={t("seriesRelatedWorksHeadingText", {
          placeholders: { "@author": author }
        })}
        items={works.map((work) => ({
          id: work.workId,
          title: work.title,
          subtitle: getSeriesLabel(work),
          url: constructMaterialUrl(materialUrl, work.workId),
          coverSrc: work.coverSrc
        }))}
        onFavorite={addToListRequest}
      />
    </section>
  );
};

export default RelatedWorks;
