import { useQuery } from "@tanstack/react-query"

import { fetchFbi } from "./fetchFbi"
import { RetrieverArticleDocument } from "./generated/graphql"

/** A Retriever article. FBI requires a logged-in patron, so this needs a user token. */
export const useRetrieverArticle = (retrieverId: string, enabled: boolean) =>
  useQuery({
    queryKey: ["fbi", "retrieverArticle", retrieverId],
    queryFn: () => fetchFbi(RetrieverArticleDocument, { id: retrieverId }),
    enabled,
  })
