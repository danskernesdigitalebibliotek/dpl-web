import { useCallback, useEffect, useState } from "react";
import {
  collectPageStatistics,
  trackEvent
} from "../../core/statistics/useStatistics";
import { statistics } from "../../core/statistics/statistics";

/**
 * Tracks search query and result count via Mapp page statistics.
 * Ported from the old search-result component.
 */
const useSearchResultTracking = ({
  q,
  hitcount
}: {
  q: string;
  hitcount: number;
}) => {
  const [canTrackHitcount, setCanTrackHitcount] = useState(false);

  // Track search query when it changes.
  useEffect(() => {
    collectPageStatistics({
      ...statistics.searchQuery,
      trackedData: q
    });
  }, [q]);

  // Track search result count when it changes.
  // Skip the initial 0 which is our default state, not a real result count.
  useEffect(() => {
    if (!canTrackHitcount) {
      setCanTrackHitcount(true);
      return;
    }
    collectPageStatistics({
      ...statistics.searchResultCount,
      trackedData: hitcount ? hitcount.toString() : "0"
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hitcount]);
};

/**
 * Tracks facet selections as click events via Mapp.
 * Formats selected facets as "facet.name:value;facet.name:value2"
 * to match the format used by the old search result.
 */
export const useFacetTracking = () => {
  const trackFacetChange = useCallback(
    (facets: { facetName: string; selectedValues: string[] }[]) => {
      const trackedData = facets
        .flatMap((f) =>
          f.selectedValues.map((v) => `facet.${f.facetName}:${v}`)
        )
        .join(";");

      trackEvent("click", {
        id: statistics.searchFacets.id,
        name: statistics.searchFacets.name,
        trackedData
      });
    },
    []
  );

  return { trackFacetChange };
};

export default useSearchResultTracking;
