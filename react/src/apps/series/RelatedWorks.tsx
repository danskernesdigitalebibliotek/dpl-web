import React from "react";
import { constructMaterialUrl } from "../../core/utils/helpers/url";
import { useUrls } from "../../core/utils/url";
import RelatedWorkCard from "./RelatedWorkCard";
import RelatedWorksSlider from "./RelatedWorksSlider";
import useRelatedWorks, { UseRelatedWorksArgs } from "./useRelatedWorks";
import "./related-works.css";

type RelatedWorksProps = UseRelatedWorksArgs;

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
      {/* Copy is hardcoded for the prototype; becomes *Text props before release. */}
      <h2 className="related-works__heading">Andre bøger af {author}</h2>
      <RelatedWorksSlider>
        {works.map((work) => (
          <RelatedWorkCard
            key={work.workId}
            title={work.title}
            url={constructMaterialUrl(materialUrl, work.workId)}
            coverPid={work.coverPid}
            authorLine={[
              work.creators.length > 0 && `af ${work.creators.join(", ")}`,
              work.year && `(${work.year})`
            ]
              .filter(Boolean)
              .join(" ")}
          />
        ))}
      </RelatedWorksSlider>
    </section>
  );
};

export default RelatedWorks;
