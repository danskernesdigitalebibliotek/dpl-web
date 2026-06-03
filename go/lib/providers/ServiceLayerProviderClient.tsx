"use client"

import { ServiceLayerProvider } from "@danskernesdigitalebibliotek/dpl-service-layer"
import { type ReactNode, useMemo } from "react"

import { getFbsConfigClient } from "@/lib/helpers/service-layer"

function ServiceLayerProviderClient({ children }: { children: ReactNode }) {
  const fbs = useMemo(() => getFbsConfigClient(), [])
  return <ServiceLayerProvider fbs={fbs}>{children}</ServiceLayerProvider>
}

export default ServiceLayerProviderClient
