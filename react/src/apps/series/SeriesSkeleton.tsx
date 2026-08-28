import React, { memo } from "react";
import SeriesCardSkeleton from "./SeriesCardSkeleton";

// Number of placeholder rows. The real member count is unknown until the query
// returns, so this is a guess at what fills a screen - the same guess the
// search result list makes while loading.
const placeholderMembers = 5;

// Covers fanned out beside the title in the header. Decoration only - they
// are hidden below the medium breakpoint.
//
// One shared constant for the skeleton and the loaded page, so that the header
// keeps its column layout when the data arrives instead of the intro text
// visibly changing width. A series without three usable covers still narrows
// the fan on arrival - see getHeaderCoverPids() - but that is the exception.
// The constant lives here rather than in Series.tsx because an import in the
// other direction would be a module cycle.
export const headerCoverCount = 3;

// React twin of design-system/src/stories/Blocks/series-page/SeriesPageSkeleton.
const SeriesSkeleton: React.FC = () => {
  return (
    <div className="series-page ssc">
      <div className="series-page__header">
        <div className="series-page__intro">
          <div className="series-page__byline">
            <div className="ssc-line w-20">&nbsp;</div>
          </div>
          <div className="series-page__title">
            <div className="ssc-head-line w-50">&nbsp;</div>
          </div>
          <div className="series-page__description">
            <div className="ssc-line mbs">&nbsp;</div>
            <div className="ssc-line mbs">&nbsp;</div>
            <div className="ssc-line w-60">&nbsp;</div>
          </div>
        </div>

        <div
          className={`series-page__covers series-page__covers--count-${headerCoverCount}`}
          aria-hidden="true"
        >
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
        {[...Array(placeholderMembers)].map((_value, index) => (
          <li className="series-page__member" key={index}>
            <SeriesCardSkeleton />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default memo(SeriesSkeleton);
