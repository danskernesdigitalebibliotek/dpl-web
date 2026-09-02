import React from "react";
import { constructMaterialUrl } from "../../core/utils/helpers/url";
import { useUrls } from "../../core/utils/url";
import { parseNumberInSeries } from "./helper";
import { RelatedWork } from "./relatedWorks.types";
import RelatedWorkCard from "./RelatedWorkCard";
import RelatedWorksSlider from "./RelatedWorksSlider";
import useRelatedWorks, { UseRelatedWorksArgs } from "./useRelatedWorks";
import "./related-works.css";

type RelatedWorksProps = UseRelatedWorksArgs;

// "Del 1 i serien Vildheks" / "Bind 1 i serien Kadaverdoktoren" - only for
// works that open one of their series. The API's own label ("Del 1",
// "Bind 1") is reused rather than reformatted; copy is hardcoded for the
// prototype like the rest of the section's texts.
const getSeriesLabel = (work: RelatedWork): string | undefined => {
  const opener = work.series.find(
    (series) => parseNumberInSeries(series.numberInSeries) === 1
  );

  if (!opener) {
    return undefined;
  }

  return `${opener.numberInSeries} i serien ${opener.title}`;
};

// The "other works by this author" section at the bottom of the series page.
// This is the only component in the section with any wiring - data comes from
// the useRelatedWorks hook, everything below renders plain props.
//
// Renders nothing when the series has no derivable author or nothing
// survived filtering: an absent section is the designed outcome, not an
// error state.
const RelatedWorks: React.FC<RelatedWorksProps> = ({
  author,
  currentSeries
}) => {
  const u = useUrls();
  const materialUrl = u("materialUrl");
  const { works, isLoading } = useRelatedWorks({ author, currentSeries });

  if (!author) {
    return null;
  }

  if (isLoading) {
    // Deliberately dumb for the prototype; a real loading state is a design
    // phase concern.
    return <p className="related-works__loading">Indlæser...</p>;
  }

  if (works.length === 0) {
    return null;
  }

  return (
    <section className="related-works">
      <RelatedWorksSlider
        heading={
          // Copy is hardcoded for the prototype; becomes *Text props before release.
          <h2 className="related-works__heading text-header-h4">
            Mere af {author}
          </h2>
        }
      >
        {works.map((work) => (
          <RelatedWorkCard
            key={work.workId}
            title={work.title}
            url={constructMaterialUrl(materialUrl, work.workId)}
            coverPid={work.coverPid}
            seriesLabel={getSeriesLabel(work)}
          />
        ))}
      </RelatedWorksSlider>
    </section>
  );
};

export default RelatedWorks;
