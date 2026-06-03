"use client"

import * as React from "react"
import { type ReactNode, createContext, useContext, useMemo } from "react"

import type { FbsConfig } from "../../fbs/src/types"

export type ServiceLayerConfig = {
  fbs: FbsConfig
}

const ServiceLayerContext = createContext<ServiceLayerConfig | null>(null)

export type ServiceLayerProviderProps = {
  fbs: FbsConfig
  children: ReactNode
}

export function ServiceLayerProvider({ fbs, children }: ServiceLayerProviderProps) {
  const value = useMemo<ServiceLayerConfig>(() => ({ fbs }), [fbs])
  return <ServiceLayerContext.Provider value={value}>{children}</ServiceLayerContext.Provider>
}

export function useServiceLayerConfig(): ServiceLayerConfig {
  const value = useContext(ServiceLayerContext)
  if (!value) {
    throw new Error(
      "useServiceLayerConfig must be used within a <ServiceLayerProvider>. " +
        "Make sure the provider is mounted near the root of your app."
    )
  }
  return value
}
