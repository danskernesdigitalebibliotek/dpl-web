import { describe, expect, it } from "vitest";
import {
  constructAdvancedSearchSubjectUrl,
  constructAdvancedSearchUrl
} from "../../core/advanced-search/url";
import {
  MATERIAL_TYPE_AUDIOBOOKS,
  MATERIAL_TYPE_EBOOKS
} from "../../core/advanced-search/material-types";
import { ComplexSearchFacetsEnum } from "../../core/dbc-gateway/generated/graphql";
import { SortOption } from "../../core/advanced-search/types";
import {
  isValidFacetState,
  isValidFilterState
} from "../../apps/advanced-search-v2/lib/validation";
import {
  buildCQLQuery,
  isWildcardQuery
} from "../../apps/advanced-search-v2/lib/query-builder";

// The produced URL is read back by advanced-search-v2's nuqs parsers, which
// silently fall back to defaults on anything they don't accept. These tests
// read it back through the same validators, so drift fails here instead.
describe("constructAdvancedSearchUrl", () => {
  const advancedSearchUrl = new URL("https://example.com/advancedsearch");

  it("writes pre-search facets the app accepts and searches on", () => {
    const url = constructAdvancedSearchUrl({
      advancedSearchUrl,
      preSearchFacets: [
        {
          facetField: ComplexSearchFacetsEnum.Generalmaterialtype,
          selectedValues: [MATERIAL_TYPE_EBOOKS, MATERIAL_TYPE_AUDIOBOOKS]
        }
      ],
      onlyExtraTitles: true,
      sort: SortOption.LatestPubDateDesc,
      view: "results"
    });

    const preSearchFacets = JSON.parse(
      url.searchParams.get("preSearchFacets") ?? ""
    );

    expect(url.pathname).toBe("/advancedsearch");
    expect(isValidFacetState(preSearchFacets)).toBe(true);
    expect(url.searchParams.get("onlyExtraTitles")).toBe("true");
    expect(url.searchParams.get("sort")).toBe(
      "sort.latestpublicationdate.desc"
    );
    expect(url.searchParams.get("view")).toBe("results");

    // The results view is only kept when the query is not a wildcard, see
    // useFormVisibility. The facet and the toggle each keep it on their own.
    expect(isWildcardQuery(buildCQLQuery([], preSearchFacets, []))).toBe(false);
    expect(isWildcardQuery(buildCQLQuery([], [], [], true))).toBe(false);
    expect(buildCQLQuery([], preSearchFacets, [], true)).toContain(
      'term.canAlwaysBeLoaned="true"'
    );
  });

  it("writes filters the app accepts", () => {
    const url = constructAdvancedSearchUrl({
      advancedSearchUrl,
      filters: [{ term: "term.subject", query: "heste & ponyer" }]
    });

    const filters = JSON.parse(url.searchParams.get("filters") ?? "");

    expect(isValidFilterState(filters)).toBe(true);
    expect(filters).toEqual([
      { term: "term.subject", query: "heste & ponyer" }
    ]);
  });

  it("leaves out parameters that are not given or empty", () => {
    const url = constructAdvancedSearchUrl({
      advancedSearchUrl,
      facets: []
    });

    expect([...url.searchParams.keys()]).toEqual([]);
  });

  it("does not modify the incoming URL", () => {
    constructAdvancedSearchUrl({ advancedSearchUrl, view: "results" });

    expect(advancedSearchUrl.search).toBe("");
  });
});

describe("constructAdvancedSearchSubjectUrl", () => {
  it("links to the results view filtered on the subject", () => {
    const url = constructAdvancedSearchSubjectUrl(
      new URL("https://example.com/advancedsearch"),
      "heste & ponyer"
    );

    const filters = JSON.parse(url.searchParams.get("filters") ?? "");

    expect(isValidFilterState(filters)).toBe(true);
    expect(filters).toEqual([
      { term: "term.subject", query: "heste & ponyer" }
    ]);
    expect(url.searchParams.get("view")).toBe("results");
  });
});
