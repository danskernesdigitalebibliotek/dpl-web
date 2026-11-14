import { useQuery } from "@tanstack/react-query"

import { useConnectionSettings } from "../connection/useConnectionSettings"
import { fetchFbi } from "./fetchFbi"
import { SearchWorksDocument } from "./generated/graphql"

const searchResultLimit = 20

/** Free-text FBI search. Waits for a query and a library token. */
export const useSearchWorks = (searchQuery: string) => {
  const { settings } = useConnectionSettings()
  return useQuery({
    queryKey: ["fbi", "searchWorks", searchQuery],
    queryFn: () =>
      fetchFbi(SearchWorksDocument, {
        q: { all: searchQuery },
        offset: 0,
        limit: searchResultLimit,
      }),
    enabled: Boolean(searchQuery && settings.libraryToken),
  })
}
