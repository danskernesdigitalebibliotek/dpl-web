import React, { useState } from "react";
import ResultPager from "./result-pager";

type PagerProps = {
  hitcount: number;
  pageSize: number;
  overrideItemsShown?: () => number;
  // Lets the caller own the page state, e.g. to keep it in the URL so the
  // loaded pages survive navigating away and back. Defaults to local state.
  pageState?: [number, (page: number) => void];
};

type PagerComponentProps = {
  classNames?: string;
  isLoading?: boolean;
};

const usePager = ({
  hitcount,
  pageSize,
  overrideItemsShown,
  pageState
}: PagerProps) => {
  const localPageState = useState<number>(0);
  const [page, setPage] = pageState ?? localPageState;

  // Derived from the page so a page restored by the caller shows all the
  // items up to and including that page. Capped at the hitcount to avoid the
  // "showing 10 out of 8"-situation.
  const itemsShown = Math.min((page + 1) * pageSize, hitcount);
  const firstInNewPage = page > 0 ? page * pageSize : null;
  // All pages loaded so far, for callers fetching each page separately.
  const pages = Array.from({ length: page + 1 }, (_, i) => i);

  const pagehandler = () => {
    setPage(page + 1);
  };

  const resetPage = () => {
    setPage(0);
  };

  const PagerComponent: React.FC<PagerComponentProps> = ({
    isLoading,
    classNames = ""
  }) =>
    hitcount ? (
      <ResultPager
        itemsShown={overrideItemsShown ? overrideItemsShown() : itemsShown}
        hitcount={hitcount}
        classNames={classNames}
        setPageHandler={pagehandler}
        isLoading={isLoading}
      />
    ) : null;

  return {
    itemsShown,
    PagerComponent,
    page,
    pages,
    firstInNewPage,
    resetPage
  };
};

export default usePager;
