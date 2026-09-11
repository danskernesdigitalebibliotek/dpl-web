import { queryOptions } from "@tanstack/react-query"

import { getDigitalMaterial } from "../digital-material"
import type { ServiceLayerConfig } from "../types"
import { serviceLayerNamespace } from "./namespace"

export const digitalMaterialQueryKey = (isbn: string | null) =>
  [serviceLayerNamespace, "digitalMaterial", isbn] as const

export const digitalMaterialQuery = (config: ServiceLayerConfig, isbn: string | null) =>
  queryOptions({
    queryKey: digitalMaterialQueryKey(isbn),
    queryFn: () => {
      if (isbn === null) {
        // The hook disables itself without an isbn; a direct caller of the
        // query options must not end up fetching /v1/metadata/null.
        throw new Error("digitalMaterialQuery cannot fetch without an isbn")
      }
      return getDigitalMaterial(config, isbn)
    },
  })
