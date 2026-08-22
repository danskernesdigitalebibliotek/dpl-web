import SeriesCardSkeleton from "../../Library/series-card/SeriesCardSkeleton";

export type SeriesPageSkeletonProps = {
  members?: number;
};

// Matches the loaded header. Without these the header would be a one-column
// grid while loading and a two-column one afterwards, so the intro text would
// visibly change width as the data arrived.
const headerCoverCount = 3;

// Skeleton for the whole series page. Like series-card's, it reuses the real
// block's element classes so the page-level widths and spacing are the ones the
// loaded page uses.
//
// The member count is a guess at what fills a screen, the same guess the search
// result list makes while loading - the real count is not known until the query
// returns.
export const SeriesPageSkeleton = ({
  members = 5,
}: SeriesPageSkeletonProps) => {
  return (
    <div className="series-page ssc">
      <div className="series-page__header">
        <div className="series-page__intro">
          <div className="ssc-line w-20">&nbsp;</div>
          <div className="series-page__title">
            <div className="ssc-head-line w-30">&nbsp;</div>
          </div>
          <div className="series-page__description">
            <div className="ssc-line mbs">&nbsp;</div>
            <div className="ssc-line mbs">&nbsp;</div>
            <div className="ssc-line w-60">&nbsp;</div>
          </div>
        </div>

        <div className="series-page__covers" aria-hidden="true">
          {[...Array(headerCoverCount)].map((_value, index) => (
            <div className="series-page__cover" key={index}>
              <div className="ssc-square cover--size-medium cover--aspect-medium">
                &nbsp;
              </div>
            </div>
          ))}
        </div>
      </div>

      <ul className="series-page__members">
        {[...Array(members)].map((_value, index) => (
          <li className="series-page__member" key={index}>
            <SeriesCardSkeleton />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SeriesPageSkeleton;
