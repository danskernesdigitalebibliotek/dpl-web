import { QueryFunctionContext } from "@tanstack/react-query";
import { beforeAll, vi } from "vitest";
import { getServiceBaseUrl } from "../utils/reduxMiddleware/extractServiceBaseUrls";
import queryMap from "./queryMap";

type Baseurl = (typeof queryMap)[keyof typeof queryMap];

export const resolveBaseUrl = (query?: string) => {
  if (!query) {
    return getServiceBaseUrl(queryMap.default) as Baseurl;
  }

  return getServiceBaseUrl(
    queryMap[query as keyof typeof queryMap] || queryMap.default
  ) as Baseurl;
};

// Every operation is posted to the same /graphql endpoint, which makes the
// requests impossible to tell apart in the browser's network log. Appending the
// operation name as a valueless query parameter (eg. /graphql?getMaterial)
// labels the request without changing it - the gateway ignores the parameter.
const operationNamePattern = /\b(?:query|mutation|subscription)\s+(\w+)/;

export const getOperationName = (query: string) =>
  query.match(operationNamePattern)?.[1];

export const addOperationNameToUrl = (url: string, query: string) => {
  const operationName = getOperationName(query);

  if (!operationName) {
    return url;
  }

  return `${url}${url.includes("?") ? "&" : "?"}${operationName}`;
};

export const getQueryUrlFromContext = (
  context: QueryFunctionContext | undefined
) => {
  // Get the default base url if no context.
  if (!context) {
    return resolveBaseUrl();
  }

  const { queryKey } = context;
  const [queryName] = queryKey;
  return resolveBaseUrl(queryName as string);
};

export default {};

/* ********************************* Vitest Section  ********************************* */
if (import.meta.vitest) {
  const { describe, expect, it } = import.meta.vitest;

  describe("DBC Gateway Requests", () => {
    beforeAll(() => {
      vi.mock("../utils/reduxMiddleware/extractServiceBaseUrls", async () => {
        const urls = {
          fbiBaseUrl: "i-am-fbi-url",
          fbiLocalBaseUrl: "i-am-fbi-local-url",
          fbiGlobalBaseUrl: "i-am-fbi-global-url"
        } as const;

        const actual = await vi.importActual(
          "../utils/reduxMiddleware/extractServiceBaseUrls"
        );

        return {
          ...(typeof actual === "object" ? actual : {}),
          getServiceBaseUrl: (apiBaseUrlKey: keyof typeof urls) => {
            return urls[apiBaseUrlKey] ?? urls.fbiBaseUrl;
          }
        };
      });
    });

    it("should resolve baseurl based on query name", () => {
      expect(resolveBaseUrl("complexSearchWithPagination")).toEqual(
        "i-am-fbi-local-url"
      );
      expect(resolveBaseUrl("complexSearchWithPaginationWorkAccess")).toEqual(
        "i-am-fbi-local-url"
      );
      expect(resolveBaseUrl("intelligentFacets")).toEqual("i-am-fbi-local-url");
      expect(resolveBaseUrl("recommendFromFaust")).toEqual(
        "i-am-fbi-local-url"
      );
      expect(resolveBaseUrl("searchFacet")).toEqual("i-am-fbi-local-url");
      expect(resolveBaseUrl("searchWithPagination")).toEqual(
        "i-am-fbi-local-url"
      );
      expect(resolveBaseUrl("suggestionsFromQueryString")).toEqual(
        "i-am-fbi-local-url"
      );
      expect(resolveBaseUrl("getInfomedia")).toEqual("i-am-fbi-global-url");
      expect(
        resolveBaseUrl("getManifestationViaBestRepresentationByFaust")
      ).toEqual("i-am-fbi-global-url");
      expect(resolveBaseUrl("getManifestationViaMaterialByFaust")).toEqual(
        "i-am-fbi-global-url"
      );
      expect(resolveBaseUrl("getMaterial")).toEqual("i-am-fbi-local-url");
      expect(resolveBaseUrl("getMaterialGlobally")).toEqual(
        "i-am-fbi-global-url"
      );
      expect(resolveBaseUrl("getReviewManifestations")).toEqual(
        "i-am-fbi-global-url"
      );
      expect(resolveBaseUrl("getSmallWork")).toEqual("i-am-fbi-global-url");
      expect(resolveBaseUrl("openOrder")).toEqual("i-am-fbi-global-url");
    });

    it("should resolve default to the fbi base url if the query is unknown", () => {
      expect(resolveBaseUrl("someUnknownQuery")).toEqual("i-am-fbi-url");
    });

    it("should resolve default to the fbi base url if no query has been specified", () => {
      expect(resolveBaseUrl()).toEqual("i-am-fbi-url");
    });
  });

  describe("Operation name in url", () => {
    it("should append the operation name of a query", () => {
      expect(
        addOperationNameToUrl(
          "https://fbi.dk/graphql",
          "query GetCoversByPids($pids: [String!]!) { ... }"
        )
      ).toEqual("https://fbi.dk/graphql?GetCoversByPids");
    });

    it("should append the operation name of a mutation", () => {
      expect(
        addOperationNameToUrl(
          "https://fbi.dk/graphql",
          "\n    mutation openOrder($input: SubmitOrder!) { ... }"
        )
      ).toEqual("https://fbi.dk/graphql?openOrder");
    });

    it("should append to an url which already has query parameters", () => {
      expect(
        addOperationNameToUrl("https://fbi.dk/graphql?foo=bar", "query Baz { }")
      ).toEqual("https://fbi.dk/graphql?foo=bar&Baz");
    });

    it("should leave the url untouched for anonymous operations", () => {
      expect(
        addOperationNameToUrl("https://fbi.dk/graphql", "{ foo }")
      ).toEqual("https://fbi.dk/graphql");
    });
  });
}
