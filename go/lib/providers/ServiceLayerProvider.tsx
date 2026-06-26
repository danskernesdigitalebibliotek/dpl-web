"use client"

import {
  ServiceLayerProvider as Provider,
  type ServiceLayerConfig,
} from "@danskernesdigitalebibliotek/dpl-service-layer"
import React, { useMemo } from "react"

import { getServiceLayerAuthHeader } from "@/lib/actions/serviceLayerAuth"
import { TServiceType, getAPServiceFetcherBaseUrl } from "@/lib/helpers/ap-service"

function ServiceLayerProvider({ children }: React.PropsWithChildren) {
  const config = useMemo<ServiceLayerConfig>(
    () => ({
      getBaseUrl: api => getAPServiceFetcherBaseUrl(api as TServiceType),
      getAuthHeader: api => getServiceLayerAuthHeader(api as TServiceType),
    }),
    []
  )
  return <Provider config={config}>{children}</Provider>
}

export default ServiceLayerProvider
