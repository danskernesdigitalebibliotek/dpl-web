import * as React from "react";
import Link from "../../components/atoms/links/Link";
import Arrow from "../../components/atoms/icons/arrow/arrow";
import { AvailabilityLabels } from "../../components/availability-label/availability-labels";
import ButtonFavourite, {
  ButtonFavouriteId
} from "../../components/button-favourite/button-favourite";
import { Cover, CoverProps } from "../../components/cover/cover";
import { redirectTo } from "../../core/utils/helpers/url";
import { Manifestation } from "../../core/utils/types/entities";
import { WorkId } from "../../core/utils/types/ids";

export type SeriesCardProps = {
  workId: WorkId;
  title: string;
  url: URL;
  coverPid: string;
  coverTint: CoverProps["tint"];
  authorLine: string;
  manifestations: Manifestation[];
  numberInSeries?: string | null;
  readThisFirstLabel?: string;
  description?: string | null;
  addToListRequest: (id: ButtonFavouriteId) => void;
};

// React twin of design-system/src/stories/Library/series-card. The design
// system ships markup and CSS classes rather than components, so these class
// names are a cross-project contract — renaming one here without renaming it
// there silently drops the styling. For the same reason there is no SCSS next
// to this file; the styles arrive with the design system's compiled base.css.
const SeriesCard: React.FC<SeriesCardProps> = ({
  workId,
  title,
  url,
  coverPid,
  coverTint,
  authorLine,
  manifestations,
  numberInSeries,
  readThisFirstLabel,
  description,
  addToListRequest
}) => {
  return (
    // The whole row navigates to the material page, as the pointer cursor on
    // .series-card promises. It cannot be one big link because it contains
    // interactive elements - the favourite button - so a click handler does
    // the navigation, the same trade-off card-list-item makes.
    //
    // Deliberately no key handler: keyboard users reach the material page
    // through the cover and title links, and a row-level Enter handler would
    // also fire when the favourite button inside the row is operated with
    // the keyboard.
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/click-events-have-key-events
    <article
      className="series-card arrow__hover--right-small"
      onClick={() => redirectTo(url)}
    >
      <div className="series-card__cover">
        <Cover
          ids={[coverPid]}
          size="small"
          animate={false}
          url={url}
          alt=""
          tint={coverTint}
        />
      </div>

      <div className="series-card__text">
        <div className="series-card__meta">
          <ButtonFavourite
            title={title}
            id={workId}
            addToListRequest={addToListRequest}
          />
          {readThisFirstLabel && (
            <span className="tag tag--small series-card__tag">
              {readThisFirstLabel}
            </span>
          )}
          {numberInSeries && (
            <span className="series-card__number">{numberInSeries}</span>
          )}
        </div>

        <h2 className="series-card__title text-header-h4">
          <Link href={url}>{title}</Link>
        </h2>

        {authorLine && (
          <p className="series-card__author text-small-caption">{authorLine}</p>
        )}

        {description && (
          <p className="series-card__description">{description}</p>
        )}
      </div>

      <div className="series-card__availability">
        <AvailabilityLabels
          cursorPointer
          workId={workId}
          manifestations={manifestations}
        />
      </div>

      <Arrow />
    </article>
  );
};

export default SeriesCard;
