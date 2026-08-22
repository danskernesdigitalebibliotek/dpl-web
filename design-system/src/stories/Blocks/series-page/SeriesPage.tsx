import Cover from "../../Library/cover/Cover";
import SeriesCard, {
  SeriesCardProps,
} from "../../Library/series-card/SeriesCard";

export type SeriesPageProps = {
  title: string;
  description?: string;
  seriesByText?: string;
  author?: string;
  authorHref?: string;
  coverSrcs?: string[];
  members: SeriesCardProps[];
};

// The whole series landing page, so that Chromatic covers the page-level
// styling and the spacing between the cards - not just a card on its own.
export const SeriesPage = ({
  title,
  description,
  seriesByText,
  author,
  authorHref = "/",
  coverSrcs = [],
  members,
}: SeriesPageProps) => {
  return (
    <div className="series-page">
      <div className="series-page__header">
        <div className="series-page__intro">
          {author && (
            <p className="series-page__byline">
              {seriesByText}{" "}
              <a className="series-page__byline-link" href={authorHref}>
                {author}
              </a>
            </p>
          )}

          <h1 className="series-page__title">{title}</h1>

          {description && (
            <p className="series-page__description">{description}</p>
          )}
        </div>

        {/*
          Decorative: every one of these covers appears again in the list
          below, so a screen reader announcing them here would only repeat
          itself.
        */}
        {coverSrcs.length > 0 && (
          <div className="series-page__covers" aria-hidden="true">
            {coverSrcs.map((src, index) => (
              <div className="series-page__cover" key={index}>
                <Cover src={src} size="medium" animate={false} />
              </div>
            ))}
          </div>
        )}
      </div>

      <ul className="series-page__members">
        {members.map((member, index) => (
          <li className="series-page__member" key={index}>
            <SeriesCard {...member} tintIndex={index} />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SeriesPage;
