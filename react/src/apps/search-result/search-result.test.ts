import { SearchResultPage } from "../../../cypress/page-objects/search-result/SearchResultPage";
import {
  givenSearchWithPaginationResponse,
  givenSearchWithPaginationEmptyResponse
} from "../../../cypress/intercepts/fbi/searchWithPagination";
import { givenSearchFacetResponse } from "../../../cypress/intercepts/fbi/searchFacet";
import { hasOperationName } from "../../../cypress/utils/graphql-test-utils";

describe("Search Result", () => {
  let page: SearchResultPage;

  beforeEach(() => {
    // Use desktop viewport to ensure sidebar filters are visible
    cy.viewport(1280, 720);

    page = new SearchResultPage();

    // Test-specific intercepts - must be set up before the generic fallback
    givenSearchWithPaginationResponse();
    givenSearchFacetResponse();

    // These intercepts are not relevant to the tests but prevent 401 errors
    // from external services that would otherwise break the test environment.
    cy.interceptGraphql({
      operationName: "GetCoversByPids",
      fixtureFilePath: "cover/cover.json"
    });
    cy.intercept(
      { url: /materiallist\.dandigbib\.org/ },
      { statusCode: 200, body: [] }
    );
    cy.intercept(
      { url: /fbs-openplatform\.dbc\.dk.*availability/ },
      { statusCode: 200, body: [] }
    );

    page.visit([]);
  });

  describe("Search Results Display", () => {
    it("displays search results", () => {
      page.verifyResultsAreVisible();
    });

    it("shows hit count in results heading", () => {
      page.verifyResultsHeadingContains("3537");
    });
  });

  describe("Toggle Filters", () => {
    it("toggles 'On shelf' filter on and off", () => {
      page.components.Filters((filters) => {
        filters.verifyOnShelfIsNotChecked();
        filters.toggleOnShelf();
        filters.verifyOnShelfIsChecked();
      });

      page.verifyUrlContains("onShelf=true");

      page.components.Filters((filters) => {
        filters.toggleOnShelf();
        filters.verifyOnShelfIsNotChecked();
      });
    });

    it("toggles 'Can always be loaned' filter on and off", () => {
      page.components.Filters((filters) => {
        filters.verifyCanAlwaysBeLoanedIsNotChecked();
        filters.toggleCanAlwaysBeLoaned();
        filters.verifyCanAlwaysBeLoanedIsChecked();
      });

      page.verifyUrlContains("facets");

      page.components.Filters((filters) => {
        filters.toggleCanAlwaysBeLoaned();
        filters.verifyCanAlwaysBeLoanedIsNotChecked();
      });
    });
  });

  describe("Sidebar Filter Groups", () => {
    it("expands and collapses filter groups", () => {
      page.components.Filters((filters) => {
        // Filter groups start collapsed
        filters.verifyFilterGroupIsCollapsed("Genre and form");

        // Expand the group
        filters.toggleFilterGroup("Genre and form");
        filters.verifyFilterGroupIsExpanded("Genre and form");

        // Collapse the group
        filters.toggleFilterGroup("Genre and form");
        filters.verifyFilterGroupIsCollapsed("Genre and form");
      });
    });

    it("selects and deselects facet values via checkboxes", () => {
      page.components.Filters((filters) => {
        // Expand the Genre and form group
        filters.toggleFilterGroup("Genre and form");
        filters.verifyFilterGroupIsExpanded("Genre and form");

        // Select a facet value
        filters.selectFacetValue("Genre and form", "jazz");
        filters.verifyFacetValueIsSelected("Genre and form", "jazz");
        filters.verifyFilterGroupBadgeCount("Genre and form", 1);

        // Select another facet value
        filters.selectFacetValue("Genre and form", "rock");
        filters.verifyFacetValueIsSelected("Genre and form", "rock");
        filters.verifyFilterGroupBadgeCount("Genre and form", 2);

        // Deselect a facet value
        filters.deselectFacetValue("Genre and form", "jazz");
        filters.verifyFacetValueIsNotSelected("Genre and form", "jazz");
        filters.verifyFilterGroupBadgeCount("Genre and form", 1);
      });
    });

    it("shows only first 5 items initially with 'Show all' button", () => {
      page.components.Filters((filters) => {
        filters.toggleFilterGroup("Genre and form");
        // Genre and form has 10 items in mock data, should show 5 initially
        filters.verifyFacetItemCount("Genre and form", 5);
        filters.verifyShowAllButtonExists("Genre and form");
      });
    });

    it("expands to show all items when clicking 'Show all'", () => {
      page.components.Filters((filters) => {
        filters.toggleFilterGroup("Genre and form");
        filters.verifyFacetItemCount("Genre and form", 5);

        // Click show all
        filters.clickShowAllInGroup("Genre and form");
        filters.verifyFacetItemCount("Genre and form", 10);

        // Click show less
        filters.clickShowAllInGroup("Genre and form");
        filters.verifyFacetItemCount("Genre and form", 5);
      });
    });
  });

  describe("Radio Button Filters", () => {
    it("allows selecting and deselecting access type radio options", () => {
      page.components.Filters((filters) => {
        // Select Online
        filters.selectRadioOption("Online");
        filters.verifyRadioOptionIsSelected("Online");
      });

      page.verifyUrlContains("facets");

      page.components.Filters((filters) => {
        // Click Online again to deselect
        filters.selectRadioOption("Online");
        filters.verifyRadioOptionIsNotSelected("Online");
      });
    });

    it("allows selecting fiction type radio options", () => {
      page.components.Filters((filters) => {
        // Select Fiktion
        filters.selectRadioOption("Fiktion");
        filters.verifyRadioOptionIsSelected("Fiktion");
      });

      page.verifyUrlContains("facets");
    });

    it("allows selecting age group radio options", () => {
      page.components.Filters((filters) => {
        // Select Voksne
        filters.selectRadioOption("Voksne");
        filters.verifyRadioOptionIsSelected("Voksne");
      });

      page.verifyUrlContains("facets");
    });

    it("allows switching between radio options in same group", () => {
      page.components.Filters((filters) => {
        // Select Online
        filters.selectRadioOption("Online");
        filters.verifyRadioOptionIsSelected("Online");
      });

      page.components.Filters((filters) => {
        // Switch to Fysisk
        filters.selectRadioOption("Fysisk");

        // Verify Fysisk is selected and Online is not
        filters.verifyRadioOptionIsSelected("Fysisk");
        filters.verifyRadioOptionIsNotSelected("Online");
      });
    });

    it("allows selecting options from multiple radio groups independently", () => {
      page.components.Filters((filters) => {
        // Select from access type
        filters.selectRadioOption("Online");

        // Select from fiction type
        filters.selectRadioOption("Fiktion");

        // Select from age group
        filters.selectRadioOption("Voksne");

        // Verify all three are selected
        filters.verifyRadioOptionIsSelected("Online");
        filters.verifyRadioOptionIsSelected("Fiktion");
        filters.verifyRadioOptionIsSelected("Voksne");
      });
    });
  });

  describe("Facets URL State", () => {
    it("adds selected facets to URL", () => {
      page.components.Filters((filters) => {
        filters.toggleFilterGroup("Genre and form");
        filters.selectFacetValue("Genre and form", "jazz");
      });

      page.verifyUrlContains("facets");
    });

    it("updates URL when adding multiple facet values", () => {
      page.components.Filters((filters) => {
        filters.toggleFilterGroup("Genre and form");
        filters.selectFacetValue("Genre and form", "jazz");
        filters.selectFacetValue("Genre and form", "rock");
      });

      page.verifyUrlContains("facets");
    });

    it("removes facet from URL when all values are deselected", () => {
      page.components.Filters((filters) => {
        filters.toggleFilterGroup("Genre and form");
        filters.selectFacetValue("Genre and form", "jazz");
      });

      page.verifyUrlContains("facets");

      page.components.Filters((filters) => {
        filters.deselectFacetValue("Genre and form", "jazz");
      });

      // Facets param should be removed from URL entirely
      cy.url().then((url) => {
        const urlObj = new URL(url);
        expect(urlObj.searchParams.has("facets")).to.equal(false);
      });
    });

    // The FBI API returns facet names "lix"/"let" but the GraphQL
    // SearchFiltersInput expects "lixRange"/"letRange". Without this
    // mapping the search query fails when these filters are selected.
    [
      { facetGroup: "LIX", expectedFilterName: "lixRange" },
      { facetGroup: "LET", expectedFilterName: "letRange" }
    ].forEach(({ facetGroup, expectedFilterName }) => {
      it(`stores ${facetGroup} filter as ${expectedFilterName} in URL`, () => {
        page.components.Filters((filters) => {
          filters.toggleFilterGroup(facetGroup);
          filters.selectFacetValue(facetGroup, "5");
        });

        cy.url().then((url) => {
          const urlObj = new URL(url);
          const facets = urlObj.searchParams.get("facets");
          expect(facets).to.contain(expectedFilterName);
        });
      });
    });

    it("supports selecting facets from multiple filter groups", () => {
      page.components.Filters((filters) => {
        // Select from Genre and form
        filters.toggleFilterGroup("Genre and form");
        filters.selectFacetValue("Genre and form", "jazz");

        // Select from Main languages
        filters.toggleFilterGroup("Main languages");
        filters.selectFacetValue("Main languages", "Dansk");
      });

      page.verifyUrlContains("facets");
    });
  });

  describe("Mobile Device - Filter Dialog", () => {
    beforeEach(() => {
      // Use mobile viewport
      cy.viewport(375, 667);
    });

    it("opens filter dialog when clicking filter button", () => {
      page.openFilterDialog();
      page.verifyDialogIsOpen();
    });

    it("closes filter dialog when clicking show results button", () => {
      page.openFilterDialog();
      page.verifyDialogIsOpen();

      page.clickShowResultsButton();
      page.verifyDialogIsClosed();
    });

    it("toggles 'On shelf' filter inside dialog", () => {
      page.openFilterDialog();

      page.components.DialogFilters((filters) => {
        filters.verifyOnShelfIsNotChecked();
        filters.toggleOnShelf();
        filters.verifyOnShelfIsChecked();
      });

      page.clickShowResultsButton();
      page.verifyUrlContains("onShelf=true");
    });

    it("toggles 'Can always be loaned' filter inside dialog", () => {
      page.openFilterDialog();

      page.components.DialogFilters((filters) => {
        filters.verifyCanAlwaysBeLoanedIsNotChecked();
        filters.toggleCanAlwaysBeLoaned();
        filters.verifyCanAlwaysBeLoanedIsChecked();
      });

      page.clickShowResultsButton();
      page.verifyUrlContains("facets");
    });

    it("expands and collapses filter groups inside dialog", () => {
      page.openFilterDialog();

      page.components.DialogFilters((filters) => {
        filters.verifyFilterGroupIsCollapsed("Genre and form");
        filters.toggleFilterGroup("Genre and form");
        filters.verifyFilterGroupIsExpanded("Genre and form");
        filters.toggleFilterGroup("Genre and form");
        filters.verifyFilterGroupIsCollapsed("Genre and form");
      });
    });

    it("selects facet values inside dialog and updates URL", () => {
      page.openFilterDialog();

      page.components.DialogFilters((filters) => {
        filters.toggleFilterGroup("Genre and form");
        filters.selectFacetValue("Genre and form", "jazz");
        filters.verifyFacetValueIsSelected("Genre and form", "jazz");
        filters.verifyFilterGroupBadgeCount("Genre and form", 1);
      });

      page.clickShowResultsButton();
      page.verifyUrlContains("facets");
    });

    it("selects multiple facet values inside dialog", () => {
      page.openFilterDialog();

      page.components.DialogFilters((filters) => {
        filters.toggleFilterGroup("Genre and form");
        filters.selectFacetValue("Genre and form", "jazz");
        filters.selectFacetValue("Genre and form", "rock");
        filters.verifyFacetValueIsSelected("Genre and form", "jazz");
        filters.verifyFacetValueIsSelected("Genre and form", "rock");
        filters.verifyFilterGroupBadgeCount("Genre and form", 2);
      });

      page.clickShowResultsButton();
      page.verifyUrlContains("facets");
    });

    it("deselects facet values inside dialog", () => {
      page.openFilterDialog();

      page.components.DialogFilters((filters) => {
        filters.toggleFilterGroup("Genre and form");
        filters.selectFacetValue("Genre and form", "jazz");
        filters.verifyFacetValueIsSelected("Genre and form", "jazz");

        filters.deselectFacetValue("Genre and form", "jazz");
        filters.verifyFacetValueIsNotSelected("Genre and form", "jazz");
      });
    });

    it("selects radio options inside dialog", () => {
      page.openFilterDialog();

      page.components.DialogFilters((filters) => {
        filters.selectRadioOption("Online");
        filters.verifyRadioOptionIsSelected("Online");
      });

      page.clickShowResultsButton();
      page.verifyUrlContains("facets");
    });

    it("allows selecting options from multiple radio groups inside dialog", () => {
      page.openFilterDialog();

      page.components.DialogFilters((filters) => {
        filters.selectRadioOption("Online");
        filters.selectRadioOption("Fiktion");
        filters.selectRadioOption("Voksne");

        filters.verifyRadioOptionIsSelected("Online");
        filters.verifyRadioOptionIsSelected("Fiktion");
        filters.verifyRadioOptionIsSelected("Voksne");
      });
    });

    it("shows 'Show all' button and expands facet list inside dialog", () => {
      page.openFilterDialog();

      page.components.DialogFilters((filters) => {
        filters.toggleFilterGroup("Genre and form");
        filters.verifyFacetItemCount("Genre and form", 5);
        filters.verifyShowAllButtonExists("Genre and form");

        filters.clickShowAllInGroup("Genre and form");
        filters.verifyFacetItemCount("Genre and form", 10);
      });
    });
  });

  describe("Web Search Teaser", () => {
    it("shows the teaser when the phrase has web search results", () => {
      page.visitStory("with-web-search-teaser");

      page.verifyWebSearchTeaser({
        label: "skovbadning (12)",
        href: "/search/web?search=skovbadning"
      });
    });

    it("hides the teaser when the config has no web search results", () => {
      // The default story's config lacks hasWebSearchResults, mirroring a
      // CMS that found no web results for the phrase.
      page.verifyNoWebSearchTeaser();
    });
  });

  describe("Zero Hits", () => {
    const facets = [{ facetName: "subjects", selectedValues: ["skovbadning"] }];

    it("redirects to the zero hits page with the search parameters", () => {
      givenSearchWithPaginationEmptyResponse();
      page.visit([], { qs: { facets: JSON.stringify(facets) } });

      // The zero hits page must receive the q and facets parameters so it
      // can offer the web search teaser for the same phrase.
      page.verifyRedirectedToZeroHitsPage("harry", facets);
    });

    it("does not redirect when already on the zero hits page", () => {
      givenSearchWithPaginationEmptyResponse();
      page.visitStory("on-zero-hits-page");

      // The app stays and renders the empty result state instead of
      // redirecting to itself in a loop. A redirect fires right after the
      // search response, so give it time to (wrongly) happen, then check
      // the story id — it is only present on the original URL.
      page.verifyResultsHeadingContains("0 materials");
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(1000);
      page.verifyUrlContains("id=apps-search-result--on-zero-hits-page");
    });
  });

  // Gives every page its own works, so the pages can be told apart.
  const givenPagedSearchResults = () => {
    cy.fixture("search-result/facet-browser/searchWithPagination.json").then(
      (fixture) => {
        cy.intercept({ method: "POST", url: "**/graphql*" }, (req) => {
          if (!hasOperationName(req, "searchWithPagination")) {
            return;
          }
          const { offset } = req.body.variables;
          req.reply({
            data: {
              search: {
                ...fixture.data.search,
                works: fixture.data.search.works.map(
                  (work: { workId: string }, i: number) => ({
                    ...work,
                    workId: `work-of:test-${offset + i}`
                  })
                )
              }
            }
          });
        });
      }
    );
  };

  describe("Show more", () => {
    beforeEach(() => {
      givenPagedSearchResults();
    });

    // Keyboard and screen reader users continue from the first new result
    // instead of starting over at the top of the list.
    it("focuses the first new result", () => {
      // Open the search result and wait for the first page.
      page.visit([]);
      cy.get(".card-list-item").should("have.length", 50);
      // Load the second page.
      cy.contains("button", "show more").click();

      // The first result of the second page has focus.
      cy.get(".card-list-item").eq(50).closest("li").should("have.focus");
    });

    // The campaign is shown before the works and must not shift which result
    // counts as the first new one.
    it("focuses the first new result when a campaign is shown", () => {
      // Show a campaign above the results.
      cy.intercept("POST", "**/dpl_campaign/match*", {
        statusCode: 200,
        body: {
          data: {
            id: "1",
            title: "Campaign title",
            url: "https://example.com/campaign",
            open_in_new_tab: false
          }
        }
      });
      // Open the search result and wait for the campaign and the first page.
      page.visit([]);
      cy.getBySel("campaign-body").should("exist");
      cy.get(".card-list-item").should("have.length", 50);
      // Load the second page.
      cy.contains("button", "show more").click();

      // The first result of the second page has focus, not the one before it.
      cy.get(".card-list-item").eq(50).closest("li").should("have.focus");
    });

    // Opening a search on a later page, e.g. from a shared link or by going
    // back, must not jump to the first result of the last page.
    it("does not move focus or scroll when opened on a later page", () => {
      // Open the search result with the second page in the URL, like when
      // reloading the page or following a shared link after showing more.
      page.visitStory("default", { qs: { page: 1 } });
      // Both pages are loaded and shown (2 pages with 50 items equals 100).
      cy.get(".card-list-item").should("have.length", 100);

      // Focusing the first new result is only for "show more". Here the user
      // did not ask for more results, so focus stays on the page itself and
      // the page is not scrolled down to the second page.
      cy.document().its("activeElement.tagName").should("eq", "BODY");
      cy.window().its("scrollY").should("eq", 0);
    });
  });

  describe("Returning to the search result", () => {
    beforeEach(() => {
      givenPagedSearchResults();
      page.visit([]);
    });

    it("keeps the loaded pages and scrolls back to the clicked work", () => {
      // Load the second page. The page is kept in the URL.
      cy.get("[data-item-id]").should("have.length", 50);
      cy.contains("button", "show more").click();
      cy.get("[data-item-id]").should("have.length", 100);
      cy.url().should("include", "page=1");

      // Open a work from the second page and go back with the browser.
      cy.get('[data-item-id="work-of:test-75"]')
        .find("[data-cy='card-list-item-title'] a")
        .click();
      cy.url().should("include", "/work/");
      cy.go("back");

      // Both pages are shown again (2 pages with 50 items equals 100), so the
      // work is still in the list.
      cy.get("[data-item-id]").should("have.length", 100);
      // The work that was opened has focus and is scrolled into view, so the
      // user continues where they left off.
      cy.get('[data-item-id="work-of:test-75"]')
        .should("have.focus")
        .and(($item) => {
          const { top, bottom } = $item[0].getBoundingClientRect();
          expect(top).to.be.greaterThan(0);
          expect(bottom).to.be.lessThan(Cypress.config("viewportHeight"));
        });
      // The work is only kept in the URL until it has been scrolled to.
      cy.url().should("not.include", "item=");
    });

    it("starts over on the first page when the filters change", () => {
      // Load the second page.
      cy.contains("button", "show more").click();
      cy.url().should("include", "page=1");
      // Change a filter, which gives a new search.
      page.components.Filters((filters) => {
        filters.toggleOnShelf();
      });
      // The page is removed from the URL and only the first page is shown.
      cy.url().should("not.include", "page=");
      cy.get("[data-item-id]").should("have.length", 50);
    });
  });

  describe("Campaign", () => {
    const visitWithCampaign = (openInNewTab: boolean) => {
      cy.intercept("POST", "**/dpl_campaign/match*", {
        statusCode: 200,
        body: {
          data: {
            id: "1",
            title: "Campaign title",
            url: "https://example.com/campaign",
            open_in_new_tab: openInNewTab
          }
        }
      });
      page.visit([]);
    };

    it("opens the campaign link in a new tab when the editor has chosen so", () => {
      visitWithCampaign(true);
      cy.getBySel("campaign-body").should("have.attr", "target", "_blank");
    });

    it("opens the campaign link in the same tab otherwise", () => {
      visitWithCampaign(false);
      cy.getBySel("campaign-body").should("not.have.attr", "target");
    });
  });
});
