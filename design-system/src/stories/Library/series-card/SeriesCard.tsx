import { AvailabilityLabelPropsType } from "../../availability-label/types";
import AvailabilityLabel from "../availability-label/AvailabilityLabel";
import Cover from "../cover/Cover";
import Tag from "../tag/Tag";
import ButtonFavourite from "../Buttons/button-favourite/ButtonFavourite";
import { ReactComponent as ArrowSmallRight } from "../Arrows/icon-arrow-ui/icon-arrow-ui-small-right.svg";
import { getCoverTint } from "../cover/helper";

export type SeriesCardProps = {
  title: string;
  href: string;
  author: string;
  year: string;
  // Arrives pre-labelled from the FBI API ("Del 1", "Bind 2"), so it is
  // rendered verbatim. Absent for members with no part number.
  numberInSeries?: string;
  // Marks the entry to start the series with. Independent of the part number:
  // it is not necessarily part 1.
  readThisFirstLabel?: string;
  description?: string;
  heartFill?: boolean;
  tintIndex?: number;
  availabilityLabels?: number;
};

// A row in a series listing, following the same shape as card-list-item but
// without its availability column, and with a description underneath.
//
// The root is an <article> rather than the <a> that card-list-item uses in this
// project: the row contains a favourite button, and interactive content inside
// an anchor is invalid HTML. The react twin makes the whole row clickable with
// a click handler for the same reason.
export const SeriesCard = ({
  title,
  href,
  author,
  year,
  numberInSeries,
  readThisFirstLabel,
  description,
  heartFill,
  tintIndex = 0,
  availabilityLabels = 2,
}: SeriesCardProps) => {
  const materialTypes: AvailabilityLabelPropsType["manifestationType"][] = [
    "Bog",
    "Ebog",
    "Lydbog (net)",
    "Lydbog (cd-mp3)",
  ];

  return (
    <article className="series-card arrow__hover--right-small">
      <div className="series-card__cover">
        <Cover
          src="images/book_cover_3.jpg"
          size="small"
          animate={false}
          tint={getCoverTint(tintIndex)}
        />
      </div>

      <div className="series-card__text">
        <div className="series-card__meta">
          <ButtonFavourite fill={heartFill} />
          {readThisFirstLabel && (
            <Tag className="series-card__tag">{readThisFirstLabel}</Tag>
          )}
          {numberInSeries && (
            <span className="series-card__number">{numberInSeries}</span>
          )}
        </div>

        <h2 className="series-card__title text-header-h4">
          <a href={href}>{title}</a>
        </h2>

        <p className="series-card__author text-small-caption">
          {`Af ${author} (${year})`}
        </p>

        {description && (
          <p className="series-card__description">{description}</p>
        )}
      </div>

      <div className="series-card__availability">
        {/* We render the amount of availability labels defined by the story. */}
        {Array(availabilityLabels)
          .fill(0)
          .map((_value, index) => {
            return (
              // A mix of available & unavailable labels, cycling through
              // material types, to emulate a realistic view.
              <AvailabilityLabel
                key={index}
                manifestationType={
                  index < 4 ? materialTypes[index] : materialTypes[index % 4]
                }
                availability="Hjemme"
                status={index % 2 === 0 ? "available" : "unavailable"}
              />
            );
          })}
      </div>

      <ArrowSmallRight />
    </article>
  );
};

export default SeriesCard;
