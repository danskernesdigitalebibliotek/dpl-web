import React, { useEffect, useState } from "react";
import useSearchResultTracking from "./useSearchResultTracking";
import { usePrevious } from "react-use";
import { isEqual } from "lodash";
import {
  useQueryState,
  parseAsJson,
  parseAsBoolean,
  parseAsInteger
} from "nuqs";
import { keepPreviousData, useQueries } from "@tanstack/react-query";
import SearchResultHeader from "../../components/search-bar/search-result-header/SearchResultHeader";
import usePager from "../../components/result-pager/use-pager";
import {
  SearchWithPaginationDocument,
  SearchWithPaginationQuery,
  SearchWithPaginationQueryVariables,
  useSearchFacetQuery,
  HoldingsStatusEnum
} from "../../core/dbc-gateway/generated/graphql";
import { fetcher } from "../../core/dbc-gateway/graphql-fetcher";
import { Work } from "../../core/utils/types/entities";
import {
  constructSearchUrlWithFacets,
  getCurrentLocation,
  redirectTo
} from "../../core/utils/helpers/url";
import { useText } from "../../core/utils/text";
import useGetSearchBranches from "../../core/utils/branches";
import SearchResultInvalidSearch from "./search-result-not-valid-search";
import { useUrls } from "../../core/utils/url";
import { useConfig } from "../../core/utils/config";
import SearchResultList, { ResultItem } from "./SearchResultList";
import SearchResultFacets from "./SearchResultFacets";
import IconFilter from "@danskernesdigitalebibliotek/dpl-design-system/build/icons/basic/icon-filter.svg";
import useDialog from "../../components/dialog/useDialog";
import Dialog from "../../components/dialog/Dialog";
import { Button } from "../../components/Buttons/Button";
import { convertFacetsToFilters, isValidFacetsState } from "./helpers";
import { isWildcardQuery } from "../advanced-search-v2/lib/query-builder";
import { allFacetFields, createFilters } from "./helper";
import { useCampaignMatchPOST } from "../../core/dpl-cms/dpl-cms";
import { CampaignMatchPOSTBody } from "../../core/dpl-cms/model/campaignMatchPOSTBody";

interface SearchResultProps {
  q: string;
  pageSize: number;
}

const SearchResult: React.FC<SearchResultProps> = ({ q, pageSize }) => {
  const u = useUrls();
  const zeroHitsSearchUrl = u("zeroHitsSearchUrl");
  const t = useText();
  const [hitcount, setHitCount] = useState<number>(0);
  const minimalQueryLength = 1;
  const config = useConfig();
  // Exclude search-blacklisted branches so works held only at blacklisted
  // branches are filtered out of the results.
  const cleanBranches = useGetSearchBranches();

  const { openDialogWithContent, closeDialog, dialogRef } = useDialog();

  // Facets state from URL via nuqs
  const [facetsFromUrl] = useQueryState(
    "facets",
    parseAsJson((facetsState) => {
      if (isValidFacetsState(facetsState)) return facetsState;
      return [];
    }).withDefault([])
  );

  // "On shelf" toggle state stored in URL (shared with advanced search)
  const [onShelf] = useQueryState("onShelf", parseAsBoolean.withDefault(false));

  // Convert nuqs facets to filters format
  const facetFilters = convertFacetsToFilters(facetsFromUrl);

  // Base filters (facets + branches)
  const baseFilters = createFilters(facetFilters, cleanBranches);
  // Include holdings status (radios are applied via facets, not direct filters)
  const searchFilters = {
    ...baseFilters,
    ...(onShelf ? { status: [HoldingsStatusEnum.Onshelf] } : {})
  };

  // The number of loaded pages is kept in the URL so the loaded results
  // survive navigating to a work and back.
  const pageState = useQueryState(
    "page",
    parseAsInteger.withDefault(0).withOptions({ history: "replace" })
  );
  const { PagerComponent, page, pages, resetPage } = usePager({
    hitcount,
    pageSize,
    pageState
  });

  // If q or filters change (eg. in Storybook context or via facets) then
  // reset the pager. Not on the initial render, as that would discard a page
  // restored from the URL.
  const searchKey = { q, pageSize, searchFilters };
  const previousSearchKey = usePrevious(searchKey);
  const hasSearchChanged =
    previousSearchKey !== undefined && !isEqual(previousSearchKey, searchKey);
  useEffect(() => {
    if (hasSearchChanged) {
      resetPage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasSearchChanged]);

  // Fetch facets for campaign matching
  const { data: facetData } = useSearchFacetQuery(
    {
      q: { all: q },
      facets: allFacetFields,
      facetLimit: 50,
      filters: searchFilters
    },
    {
      placeholderData: keepPreviousData
    }
  );

  const facets = facetData?.search.facets || [];

  const campaignMutation = useCampaignMatchPOST();

  useEffect(() => {
    if (facets.length === 0) return;

    const body: CampaignMatchPOSTBody = {
      queries: [{ text: q }],
      facets: facets.map((facet) => ({
        name: facet.name,
        values: facet.values.map((v) => ({
          key: v.key,
          term: v.term,
          score: v.score ?? undefined
        }))
      }))
    };

    campaignMutation.mutate({
      data: body,
      params: { _format: "json" }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facets]);

  // Each loaded page is fetched separately. When the search has just changed
  // only the first page is fetched, as the pager is about to be reset.
  const pageQueries = useQueries({
    queries: (hasSearchChanged ? [0] : pages).map((p) => {
      const variables: SearchWithPaginationQueryVariables = {
        q: { all: q },
        offset: p * pageSize,
        limit: pageSize,
        filters: searchFilters
      };
      return {
        // Same key as useSearchWithPaginationQuery so the cache is shared.
        queryKey: ["searchWithPagination", variables],
        queryFn: fetcher<
          SearchWithPaginationQuery,
          SearchWithPaginationQueryVariables
        >(SearchWithPaginationDocument, variables),
        enabled: q.length >= minimalQueryLength
      };
    })
  });
  const data = pageQueries[0]?.data;
  const isLoading = pageQueries.some((query) => query.isLoading);

  // Pages are shown in order, up to the first page which has not loaded yet.
  const loadedPages = pageQueries.findIndex((query) => !query.data);
  const resultItems = pageQueries
    .slice(0, loadedPages === -1 ? undefined : loadedPages)
    .flatMap((query) => (query.data?.search.works ?? []) as Work[]);

  // A search without results sends the user to the dedicated zero-hits page.
  useEffect(() => {
    if (data?.search.hitcount !== 0) {
      return;
    }
    // A zero hits URL misconfigured to point at a page hosting this app would
    // make the redirect loop forever.
    if (new URL(getCurrentLocation()).pathname === zeroHitsSearchUrl.pathname) {
      return;
    }
    // Carry the search parameters along so the zero hits page can offer the
    // web search teaser for the same phrase.
    redirectTo(
      constructSearchUrlWithFacets({
        searchUrl: zeroHitsSearchUrl,
        q,
        facets: facetsFromUrl
      })
    );
  }, [data, zeroHitsSearchUrl, q, facetsFromUrl]);

  // Keep the previous hitcount while a changed search is loading.
  useEffect(() => {
    if (data) {
      setHitCount(data.search.hitcount);
    }
  }, [data]);

  useSearchResultTracking({ q, hitcount });

  if (!q || q.length < minimalQueryLength) {
    return <SearchResultInvalidSearch />;
  }

  const isWildcardQuerySearch = isWildcardQuery(q);

  const headerTitle = isWildcardQuerySearch
    ? t("showingAllMaterialsText")
    : t("showingResultsForText", { placeholders: { "@query": q } });

  // Get search info box data from config
  const {
    title: infoBoxTitle,
    content: infoBoxContent,
    buttonLabel: infoBoxButtonLabel,
    buttonUrl: infoBoxButtonUrl
  } = config<{
    title?: string;
    content: { value?: string };
    buttonLabel?: string;
    buttonUrl?: string;
  }>("searchInfoboxConfig", {
    transformer: "jsonParse"
  });
  const infoBoxHtml = infoBoxContent?.value || "";

  const webSearchConfig = config<{
    webSearchUrl: string;
    webSearchText: string;
    webSearchTotal: string;
    hasWebSearchResults: boolean;
  }>("webSearchConfig", {
    transformer: "jsonParse"
  });

  return (
    <div className="search">
      <SearchResultHeader
        headerTitle={headerTitle}
        subtitleRenderProp={
          webSearchConfig?.hasWebSearchResults &&
          webSearchConfig?.webSearchUrl &&
          webSearchConfig?.webSearchText ? (
            <>
              {`${t("webSearchLinkText")} `}
              <a
                className="link-tag text-body-medium-medium"
                href={webSearchConfig.webSearchUrl}
              >
                {webSearchConfig.webSearchTotal
                  ? `${webSearchConfig.webSearchText} (${webSearchConfig.webSearchTotal})`
                  : webSearchConfig.webSearchText}
              </a>
            </>
          ) : null
        }
      />
      <div className="search__results">
        <div className="search__grid">
          <SearchResultFacets facets={facets} />

          <section>
            <div className="search__results-top-bar">
              <div className="search__results-top-bar__left">
                <h2 className="search__results-heading">
                  {t("searchShowingMaterialsText", {
                    placeholders: { "@hitcount": hitcount }
                  })}
                </h2>
              </div>
              <div className="search__results-top-bar__right">
                <button
                  onClick={() => openDialogWithContent(true)}
                  className="search__modify-filters-button"
                >
                  <img src={IconFilter} alt="" />
                  <span>{t("addMoreFiltersText")}</span>
                </button>

                <Dialog isSidebar closeDialog={closeDialog} ref={dialogRef}>
                  <div className="search-facets__dialog">
                    <div className="search-facets__dialog-content">
                      <h2 className="search-facets__dialog-content__heading">
                        {t("searchDialogFilterMaterialsText", {
                          placeholders: { "@hitcount": hitcount }
                        })}
                      </h2>
                      <SearchResultFacets facets={facets} />
                    </div>
                    <div className="search-facets__dialog__actions">
                      <Button
                        classNames="search-facets__dialog__actions__button"
                        collapsible
                        label={t("searchShowResultsText")}
                        size="medium"
                        buttonType="none"
                        variant="filled"
                        onClick={closeDialog}
                      />
                    </div>
                  </div>
                </Dialog>
              </div>
            </div>
            <SearchResultList
              resultItems={
                [
                  ...(campaignMutation.data?.data
                    ? [campaignMutation.data.data]
                    : []),
                  ...resultItems
                ] as ResultItem[]
              }
              isLoading={isLoading}
              page={page}
              pageSize={pageSize}
              restoreScrollToClickedItem
              infoBoxProps={{
                title: infoBoxTitle,
                html: infoBoxHtml,
                buttonLabel: infoBoxButtonLabel,
                buttonUrl: infoBoxButtonUrl
                  ? new URL(infoBoxButtonUrl, getCurrentLocation())
                  : undefined
              }}
            />
            <PagerComponent isLoading={isLoading} />
          </section>
        </div>
      </div>
    </div>
  );
};

export default SearchResult;
