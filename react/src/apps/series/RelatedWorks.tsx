import React from "react";
import { useDispatch } from "react-redux";
import ButtonFavourite, {
  ButtonFavouriteId
} from "../../components/button-favourite/button-favourite";
import { StaticCover } from "../../components/cover/static-cover";
import { StaticRecommendedMaterial } from "../../components/recommended-material/static-recommended-material";
import { guardedRequest } from "../../core/guardedRequests.slice";
import { TypedDispatch } from "../../core/store";
import { constructMaterialUrl } from "../../core/utils/helpers/url";
import { useUrls } from "../../core/utils/url";
import { parseNumberInSeries } from "./helper";
import { RelatedWork } from "./relatedWorks.types";
import RelatedWorksSlider from "./RelatedWorksSlider";
import useRelatedWorks, { UseRelatedWorksArgs } from "./useRelatedWorks";

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
// the useRelatedWorks hook, the cards are the same static components
// MaterialGrid items are built from.
//
// Renders nothing when the series has no derivable author or nothing
// survived filtering: an absent section is the designed outcome, not an
// error state.
//
// Card clicks are deliberately not tracked yet: reusing another feature's
// Mapp statistic would miscount it, and a dedicated id needs coordination.
const RelatedWorks: React.FC<RelatedWorksProps> = ({
  author,
  currentSeries
}) => {
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
          <h2 className="related-works__heading text-header-h2">
            Mere af {author}
          </h2>
        }
      >
        {works.map((work) => {
          const workUrl = constructMaterialUrl(materialUrl, work.workId);

          return (
            <StaticRecommendedMaterial
              key={work.workId}
              title={work.title}
              subtitle={getSeriesLabel(work)}
              isPartOfGrid
              linkProps={{ href: workUrl }}
              cover={
                <StaticCover
                  src={work.coverSrc ?? undefined}
                  displaySize="large"
                  shadow="medium"
                  alt=""
                  linkProps={{ url: workUrl }}
                />
              }
              favoriteButton={
                <ButtonFavourite
                  title={work.title}
                  id={work.workId}
                  addToListRequest={addToListRequest}
                />
              }
            />
          );
        })}
      </RelatedWorksSlider>
    </section>
  );
};

export default RelatedWorks;
