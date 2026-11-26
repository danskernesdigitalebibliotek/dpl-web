import { useQuery } from "@tanstack/react-query"

import { useConnectionSettings } from "../connection/useConnectionSettings"
import { fetchFbi } from "./fetchFbi"
import { PeriodicalByIssnDocument } from "./generated/graphql"

/** The CQL search for a periodical by its ISSN. Waits for a CQL query and a library token. */
export const usePeriodicalByIssn = (cql: string | undefined) => {
  const { settings } = useConnectionSettings()
  return useQuery({
    queryKey: ["fbi", "periodicalByIssn", cql],
    queryFn: () => fetchFbi(PeriodicalByIssnDocument, { cql: cql ?? "" }),
    enabled: Boolean(cql && settings.libraryToken),
  })
}
