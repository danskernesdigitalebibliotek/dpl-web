import { useQuery } from "@tanstack/react-query"

import { useConnectionSettings } from "../connection/useConnectionSettings"
import { fetchFbi } from "./fetchFbi"
import { SearchArticlesDocument } from "./generated/graphql"

const searchResultLimit = 20

/** The CQL that keeps a free-text search to articles. */
export const getArticleSearchCql = (searchQuery: string) =>
  `term.default="${searchQuery.replaceAll('"', "")}" AND phrase.generalmaterialtype="artikler"`

/** Free-text FBI search among articles. Waits for a query and a library token. */
export const useSearchArticles = (searchQuery: string) => {
  const { settings } = useConnectionSettings()
  return useQuery({
    queryKey: ["fbi", "searchArticles", searchQuery],
    queryFn: () =>
      fetchFbi(SearchArticlesDocument, { cql: getArticleSearchCql(searchQuery), offset: 0, limit: searchResultLimit }),
    enabled: Boolean(searchQuery && settings.libraryToken),
  })
}
