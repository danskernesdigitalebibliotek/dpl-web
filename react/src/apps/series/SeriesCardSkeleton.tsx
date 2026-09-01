import React, { memo } from "react";

// React twin of design-system/src/stories/Library/series-card/SeriesCardSkeleton.
// It reuses the real block's element classes rather than the generic ssc
// wrappers, so the row occupies the same space as the loaded card and does not
// jump when the data arrives.
const SeriesCardSkeleton: React.FC = () => {
  return (
    <article className="series-card ssc">
      <div className="series-card__cover">
        <div className="ssc-square cover--size-small">&nbsp;</div>
      </div>

      <div className="series-card__text">
        <div className="series-card__meta">
          <div className="ssc-line w-30">&nbsp;</div>
        </div>
        <div className="ssc-head-line w-80" />
        <div className="ssc-line w-30 mb">&nbsp;</div>
        <div className="ssc-line mbs">&nbsp;</div>
        <div className="ssc-line w-90">&nbsp;</div>
      </div>

      <div className="series-card__availability">
        <div className="ssc-line">&nbsp;</div>
        <div className="ssc-line">&nbsp;</div>
      </div>
    </article>
  );
};

export default memo(SeriesCardSkeleton);
