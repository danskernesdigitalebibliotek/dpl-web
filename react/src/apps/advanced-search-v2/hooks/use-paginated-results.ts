import { useState, useEffect, useMemo } from "react";
import { isEqual } from "lodash";
import { useQueryState, parseAsInteger } from "nuqs";
import { useQueries } from "@tanstack/react-query";
import usePager from "../../../components/result-pager/use-pager";
import { Work } from "../../../core/utils/types/entities";
import {
  ComplexSearchWithPaginationDocument,
  ComplexSearchWithPaginationQuery,
  ComplexSearchWithPaginationQueryVariables,
  CsHoldingsStatusEnum
} from "../../../core/dbc-gateway/generated/graphql";
import { fetcher } from "../../../core/dbc-gateway/graphql-fetcher";
import { SortOption } from "../types";
import { getSortInput } from "../lib/sort-utils";
import useGetSearchBranches from "../../../core/utils/branches";
import { useGetPhysicalHoldingsFilters } from "../../../core/utils/useGetPhysicalHoldingsFilters";
import { usePrevious } from "react-use";

export interface UsePaginatedResultsReturn {
  resultItems: Work[];
  hitcount: number;
  page: number;
  PagerComponent: React.FC<{ isLoading?: boolean }>;
  resetPage: () => void;
  isLoadingOrRefetching: boolean;
  shouldShowSearchResults: boolean;
  shouldShowZeroResults: boolean;
}

interface UsePaginatedResultsProps {
  cql: string;
  isSearchEnabled: boolean;
  onShelf: boolean;
  pageSize: number;
  sort: SortOption;
}

/**
 * Hook to manage paginated search results with infinite scroll behavior.
 *
 * Key behaviors:
 * - Accumulates results across pages (infinite scroll pattern)
 * - Keeps the number of loaded pages in the URL, so the results survive
 *   navigating to a work and back
 * - Resets accumulated results when query parameters change (cql, sort, onShelf)
 * - Prevents "zero results" flash during query transitions
 * - Disables React Query caching to avoid stale data conflicts
 */
export const usePaginatedResults = ({
  cql,
  isSearchEnabled,
  onShelf,
  pageSize,
  sort
}: UsePaginatedResultsProps): UsePaginatedResultsReturn => {
  const cleanBranches = useGetSearchBranches();
  const physicalHoldingsFilters = useGetPhysicalHoldingsFilters();
  const [hitcount, setHitCount] = useState(0);

  // Tracks when we're transitioning between different queries.
  // React Query's isFetching doesn't distinguish between "loading more pages"
  // and "loading fresh results after query change", so we track this separately.
  const [isRefetching, setIsRefetching] = useState(false);

  // Guards against showing "zero results" prematurely during query transitions.
  // Without this, there's a brief moment where hitcount=0 (from reset) and
  // isLoading=false (before React Query starts), which would flash the zero state.
  const [canShowZeroResults, setCanShowZeroResults] = useState(false);

  // Track query parameters to detect when we need to reset accumulated results.
  // Using usePrevious + isEqual provides cleaner change detection than manual state.
  // Includes onShelf to ensure filter changes reset pagination properly.
  const currentQuery = useMemo(
    () => ({ cql, sort, onShelf }),
    [cql, sort, onShelf]
  );
  const prevQuery = usePrevious(currentQuery);
  const hasQueryChanged =
    prevQuery !== undefined && !isEqual(prevQuery, currentQuery);

  const pageState = useQueryState(
    "page",
    parseAsInteger.withDefault(0).withOptions({ history: "replace" })
  );
  const { PagerComponent, page, pages, resetPage } = usePager({
    hitcount,
    pageSize,
    pageState
  });

  // Each loaded page is fetched separately. When the query has just changed
  // only the first page is fetched, as the pager is about to be reset.
  const pageQueries = useQueries({
    queries: (hasQueryChanged ? [0] : pages).map((p) => {
      const variables: ComplexSearchWithPaginationQueryVariables = {
        cql,
        offset: p * pageSize,
        limit: pageSize,
        filters: {
          // Always exclude search-blacklisted branches so works held only at
          // blacklisted branches are filtered out of the results.
          branchId: cleanBranches,
          ...(onShelf && {
            status: [CsHoldingsStatusEnum.Onshelf],
            // Filtering on-shelf is a physical-holdings filter, so also exclude
            // online editions and restrict to the site's own agency.
            ...physicalHoldingsFilters
          })
        },
        sort: getSortInput(sort)
      };
      return {
        // Same key as useComplexSearchWithPaginationQuery.
        queryKey: ["complexSearchWithPagination", variables],
        queryFn: fetcher<
          ComplexSearchWithPaginationQuery,
          ComplexSearchWithPaginationQueryVariables
        >(ComplexSearchWithPaginationDocument, variables),
        enabled: isSearchEnabled,
        // Always fetch fresh results when the user toggles facets or changes
        // sort.
        gcTime: 0,
        staleTime: 0
      };
    })
  });
  const isLoading = pageQueries.some((query) => query.isLoading);
  const isFetching = pageQueries.some((query) => query.isFetching);
  const firstPageData = pageQueries[0]?.data;
  useEffect(() => {
    if (firstPageData) {
      setHitCount(firstPageData.complexSearch.hitcount);
    }
  }, [firstPageData]);

  // Pages are shown in order, up to the first page which has not loaded yet.
  const loadedPages = pageQueries.findIndex((query) => !query.data);
  const resultItems = pageQueries
    .slice(0, loadedPages === -1 ? undefined : loadedPages)
    .flatMap((query) => (query.data?.complexSearch.works ?? []) as Work[]);

  // Reset accumulated results when query parameters change.
  // This ensures users see fresh results when toggling facets or changing sort.
  useEffect(() => {
    if (hasQueryChanged) {
      setHitCount(0);
      setIsRefetching(true);
      setCanShowZeroResults(false);
      resetPage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasQueryChanged]);

  // Mark refetching complete once data arrives.
  // This enables showing "zero results" only after we've actually fetched.
  useEffect(() => {
    if (!isFetching && !isLoading) {
      if (isRefetching) {
        setIsRefetching(false);
      }
      // Allow zero results to show after any completed fetch (initial or refetch)
      setCanShowZeroResults(true);
    }
  }, [isFetching, isLoading, isRefetching]);

  const isLoadingOrRefetching = isLoading || isFetching || isRefetching;
  const shouldShowSearchResults =
    isLoadingOrRefetching || resultItems.length > 0;
  const shouldShowZeroResults =
    !isLoadingOrRefetching && hitcount === 0 && canShowZeroResults;

  return {
    resultItems,
    hitcount,
    page,
    PagerComponent,
    resetPage,
    isLoadingOrRefetching,
    shouldShowSearchResults,
    shouldShowZeroResults
  };
};
