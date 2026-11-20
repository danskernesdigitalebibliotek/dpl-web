import { useQuery } from "@tanstack/react-query"

import { useConnectionSettings } from "../connection/useConnectionSettings"
import { fetchFbi } from "./fetchFbi"
import { WorkPageDocument } from "./generated/graphql"

/** Everything the work page shows about a work and its manifestations. */
export const useWork = (workId: string) => {
  const { settings } = useConnectionSettings()
  return useQuery({
    queryKey: ["fbi", "workPage", workId],
    queryFn: () => fetchFbi(WorkPageDocument, { workId }),
    enabled: Boolean(settings.libraryToken),
  })
}
