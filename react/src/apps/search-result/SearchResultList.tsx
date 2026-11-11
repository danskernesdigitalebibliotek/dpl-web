import React, { Fragment, memo, useEffect, useRef } from "react";
import clsx from "clsx";
import { usePrevious } from "react-use";
import { getCoverTint } from "../../core/utils/helpers/general";
import { Work } from "../../core/utils/types/entities";
import CardListItem from "../../components/card-item-list/card-list-item/card-list-item";
import CardListItemSkeleton from "../../components/card-item-list/card-list-item/card-list-item-skeleton";
import MaterialListItem from "../../components/card-item-list/MaterialListItem";
import CardListInfoBox, {
  CardListInfoBoxProps
} from "../../components/card-item-list/CardListInfoBox";
import Campaign from "../../components/campaign/Campaign";
import { CampaignMatchPOST200Data } from "../../core/dpl-cms/model";

export type ResultItem = Work | CampaignMatchPOST200Data;

const isCampaign = (item: ResultItem): item is CampaignMatchPOST200Data =>
  !("workId" in item);

export interface SearchResultListProps {
  resultItems?: ResultItem[];
  isLoading?: boolean;
  page: number;
  pageSize: number;
  infoBoxProps?: CardListInfoBoxProps;
  className?: string;
}

const SearchResultList: React.FC<SearchResultListProps> = ({
  resultItems,
  isLoading,
  page,
  pageSize,
  infoBoxProps,
  className
}) => {
  const lastItemRef = useRef<HTMLLIElement>(null);

  // Focus the first item of a page loaded with the pager. Not when the list
  // mounts on a later page, e.g. restored from the URL.
  const previousPage = usePrevious(page);
  const shouldFocusNewPage = useRef(false);
  if (previousPage !== undefined && page > previousPage) {
    shouldFocusNewPage.current = true;
  }
  useEffect(() => {
    if (shouldFocusNewPage.current && lastItemRef.current) {
      lastItemRef.current.focus();
      shouldFocusNewPage.current = false;
    }
  }, [page, resultItems]);

  const searchInfoBoxIndex = pageSize;
  // A campaign is shown before the works and must not count as one of them.
  const campaignOffset = resultItems?.[0] && isCampaign(resultItems[0]) ? 1 : 0;

  return (
    <ul
      className={clsx("content-list", className)}
      data-cy="search-result-list"
    >
      {resultItems?.map((item, i) => {
        const isFirstNewItem = i === page * pageSize + campaignOffset;
        if (isCampaign(item)) {
          return (
            <MaterialListItem
              className="content-list__item"
              key="campaign"
              ref={isFirstNewItem ? lastItemRef : null}
            >
              <Campaign campaignData={item} />
            </MaterialListItem>
          );
        } else if (
          i === searchInfoBoxIndex &&
          infoBoxProps?.title &&
          infoBoxProps?.html
        ) {
          return (
            <Fragment key={item.workId}>
              <MaterialListItem className="content-list__item content-list__item--info-box">
                <CardListInfoBox
                  title={infoBoxProps?.title}
                  html={infoBoxProps?.html}
                  buttonLabel={infoBoxProps?.buttonLabel}
                  buttonUrl={infoBoxProps?.buttonUrl}
                />
              </MaterialListItem>
              <MaterialListItem
                className="content-list__item"
                ref={isFirstNewItem ? lastItemRef : null}
              >
                <CardListItem
                  item={item}
                  coverTint={getCoverTint(i)}
                  resultNumber={i + 1}
                />
              </MaterialListItem>
            </Fragment>
          );
        } else {
          return (
            <MaterialListItem
              className="content-list__item"
              key={item.workId}
              ref={isFirstNewItem ? lastItemRef : null}
            >
              <CardListItem
                item={item}
                coverTint={getCoverTint(i)}
                resultNumber={i + 1}
              />
            </MaterialListItem>
          );
        }
      })}

      {isLoading && (
        <>
          {/*
            Show skeleton search result items if no data is available yet or
            while loading additional pages. We'll show 5 items which should
            cover most screens.
          */}
          {[...Array(5)].map((_, index) => (
            <li key={index} className="content-list__item">
              <CardListItemSkeleton />
            </li>
          ))}
        </>
      )}
    </ul>
  );
};

export default memo(SearchResultList);
