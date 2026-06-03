import { queryOptions } from "@tanstack/react-query"

import { getPatron } from "../patron"
import { patronQueryKey } from "../queryKeys"
import type { ServiceLayerConfig } from "../types"

export const patronQuery = (config: ServiceLayerConfig) =>
  queryOptions({
    queryKey: patronQueryKey(),
    queryFn: () => getPatron(config),
  })
