import Cover from "../../Library/cover/Cover";
import ResultPager from "../../Library/card-list-page/ResultPager";
import SeriesCard, {
  SeriesCardProps,
} from "../../Library/series-card/SeriesCard";

export type SeriesPageProps = {
  title: string;
  description?: string;
  seriesByText?: string;
  author?: string;
  authorHref?: string;
  // At most three. Fewer is a legitimate state - a short series, or one whose
  // materials have no cover image - and the fan is angled to suit the count.
  coverSrcs?: string[];
  members: SeriesCardProps[];
  // Members in the whole series, of which `members` is the first page. Long
  // series run to hundreds, so anything above the number listed leaves the
  // "show more" button in place. Defaults to a series that fits on one page.
  totalMembers?: number;
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
  totalMembers = members.length,
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
          <div
            className={`series-page__covers series-page__covers--count-${coverSrcs.length}`}
            aria-hidden="true"
          >
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

      {/*
        Outside the member list rather than inside it: the pager is not one of
        the members, and the list's own container width would narrow it.
      */}
      <ResultPager
        currentResults={members.length}
        totalResults={totalMembers}
      />
    </div>
  );
};

export default SeriesPage;
