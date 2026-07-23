import { describe, expect, it } from "vitest";
import { constructSearchUrlWithFacets } from "../../core/utils/helpers/url";

// The produced URL is the wire contract with the CMS: dpl_search reads the
// q and facets parameters to build the web search teaser. If this format
// changes, the CMS side must change with it.
describe("constructSearchUrlWithFacets", () => {
  const searchUrl = new URL("https://example.com/search");

  it("carries the query and the facets as JSON", () => {
    const url = constructSearchUrlWithFacets({
      searchUrl,
      q: "*",
      facets: [{ facetName: "subjects", selectedValues: ["skovbadning"] }]
    });

    expect(url.pathname).toBe("/search");
    expect(url.searchParams.get("q")).toBe("*");
    expect(JSON.parse(url.searchParams.get("facets") ?? "")).toEqual([
      { facetName: "subjects", selectedValues: ["skovbadning"] }
    ]);
  });

  it("omits the facets parameter when there are none", () => {
    const url = constructSearchUrlWithFacets({
      searchUrl,
      q: "harry",
      facets: []
    });

    expect(url.searchParams.get("q")).toBe("harry");
    expect(url.searchParams.has("facets")).toBe(false);
  });

  it("double encodes the query, which the CMS compensates for with urldecode", () => {
    const url = constructSearchUrlWithFacets({
      searchUrl,
      q: "skov badning",
      facets: []
    });

    expect(url.searchParams.get("q")).toBe("skov%20badning");
  });

  it("does not modify the search URL it is given", () => {
    constructSearchUrlWithFacets({ searchUrl, q: "harry", facets: [] });

    expect(searchUrl.searchParams.has("q")).toBe(false);
  });
});
