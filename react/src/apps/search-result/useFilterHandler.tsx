import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  add,
  remove,
  clear,
  FilterPayloadType,
  Filter,
  FilterPayloadTypeWithOrigin
} from "../../core/filter.slice";
import { store, RootState } from "../../core/store";
import { getAllFilterPathsAsString } from "./helper";
import { useEventStatistics } from "../../core/statistics/useStatistics";
import { statistics } from "../../core/statistics/statistics";

// The filter state lives in persisted Redux only. The handler used to mirror
// a `filters=usePersistedFilters` sentinel and facet parameter names into the
// URL with the hand-rolled history writers, but nothing has read those
// parameters since search-result moved to the nuqs-owned `facets` parameter,
// so the URL coupling was dropped instead of migrated (see ADR-014).
const useFilterHandler = () => {
  const { track } = useEventStatistics();
  const dispatch = useDispatch();
  const filters = useSelector((state: RootState) => state.filter) as Filter;

  const clearFilter = useCallback(() => {
    dispatch(clear());
  }, [dispatch]);

  const addToFilter = useCallback(
    (payload: FilterPayloadTypeWithOrigin) => {
      dispatch(add(payload));

      // Track the click event after updating the filters.
      // Use the store directly to get the latest filters state immediately after dispatch.
      // Determine the origin of the click event and track accordingly.
      const updatedFilters = store.getState().filter as Filter;

      if (payload.origin === "facetLine") {
        track("click", {
          id: statistics.facetsByFacetLineClick.id,
          name: statistics.facetsByFacetLineClick.name,
          trackedData: getAllFilterPathsAsString(updatedFilters, payload.origin)
        });
      }
      if (payload.origin === "facetBrowser") {
        track("click", {
          id: statistics.searchFacets.id,
          name: statistics.searchFacets.name,
          trackedData: getAllFilterPathsAsString(updatedFilters, payload.origin)
        });
      }
    },
    [dispatch, track]
  );

  const removeFromFilter = useCallback(
    (payload: FilterPayloadType) => {
      dispatch(remove(payload));
    },
    [dispatch]
  );

  return {
    filters,
    addToFilter,
    removeFromFilter,
    clearFilter
  };
};

export default useFilterHandler;
