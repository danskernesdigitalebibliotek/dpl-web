import clsx from "clsx";
import * as React from "react";
import Link from "../../components/atoms/links/Link";
import ButtonFavourite, {
  ButtonFavouriteId
} from "../../components/button-favourite/button-favourite";
import { StaticCover } from "../../components/cover/StaticCover";
import { WorkId } from "../../core/utils/types/ids";
import { useEventStatistics } from "../../core/statistics/useStatistics";
import { statistics } from "../../core/statistics/statistics";

export type RecommendedMaterialProps = {
  wid: WorkId;
  title: string;
  author: string;
  coverUrl?: string | null;
  url: URL;
  partOfGrid?: boolean;
  onAddToFavourites: (id: ButtonFavouriteId) => void;
};

// Presentational: receives render-ready material data. Fetching and mapping
// happens in the surrounding component (e.g. RecommendedMaterialAdapter or
// the material grid wrappers).
const RecommendedMaterial: React.FC<RecommendedMaterialProps> = ({
  wid,
  title,
  author,
  coverUrl,
  url,
  partOfGrid = false,
  onAddToFavourites
}) => {
  const { track } = useEventStatistics();

  // Materials shown in a grid are tracked as their own Mapp event so DDF can
  // compare grid-formidling against other ways of presenting materials.
  const clickStatistics = partOfGrid
    ? statistics.materialGridClick
    : statistics.recommendedMaterial;

  const trackData = () =>
    track("click", {
      id: clickStatistics.id,
      name: clickStatistics.name,
      trackedData: wid
    });

  return (
    <div
      className={clsx(
        "recommended-material",
        partOfGrid && "recommended-material--in-grid"
      )}
    >
      <div className="recommended-material__icon">
        <ButtonFavourite
          title={title}
          id={wid}
          addToListRequest={onAddToFavourites}
        />
      </div>
      <StaticCover
        src={coverUrl}
        url={url}
        size="large"
        animate
        alt=""
        shadow="medium"
        trackClick={trackData}
      />
      <div className="recommended-material__texts">
        {title && (
          <Link
            href={url}
            className="recommended-material__description"
            dataCy="recommended-description"
            trackClick={trackData}
          >
            {title}
          </Link>
        )}

        {author && (
          <Link
            href={url}
            className="recommended-material__author"
            dataCy="recommended-author"
            trackClick={trackData}
          >
            {author}
          </Link>
        )}
      </div>
    </div>
  );
};
export default RecommendedMaterial;
