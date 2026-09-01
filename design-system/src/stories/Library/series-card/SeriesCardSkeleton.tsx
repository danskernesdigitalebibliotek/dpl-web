// Skeleton for series-card.
//
// It reuses the real block's element classes rather than the generic ssc
// wrappers, so the grid, padding and gaps are the ones the loaded card uses and
// the row does not jump when the data arrives. It also means a later change to
// the card's layout carries over here for free.
export const SeriesCardSkeleton = () => {
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

export default SeriesCardSkeleton;
