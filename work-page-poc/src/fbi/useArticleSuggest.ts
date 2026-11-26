import { useQuery } from "@tanstack/react-query"

import { useConnectionSettings } from "../connection/useConnectionSettings"
import { fetchFbi } from "./fetchFbi"
import { ArticleSuggestDocument } from "./generated/graphql"

export const minimumSuggestLength = 3

/** FBI's suggestions among articles. Waits for enough characters and a library token. */
export const useArticleSuggest = (query: string) => {
  const { settings } = useConnectionSettings()
  return useQuery({
    queryKey: ["fbi", "articleSuggest", query],
    queryFn: () => fetchFbi(ArticleSuggestDocument, { q: query }),
    enabled: query.length >= minimumSuggestLength && Boolean(settings.libraryToken),
    placeholderData: (previous) => previous,
  })
}
