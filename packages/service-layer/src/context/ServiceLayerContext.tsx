"use client"

import React, { type ReactNode, createContext, useContext } from "react"

import type { ServiceLayerConfig } from "../types"

const ServiceLayerContext = createContext<ServiceLayerConfig | null>(null)

type ServiceLayerProviderProps = {
  config: ServiceLayerConfig
  children: ReactNode
}

export const ServiceLayerProvider = ({ config, children }: ServiceLayerProviderProps) => (
  <ServiceLayerContext.Provider value={config}>{children}</ServiceLayerContext.Provider>
)

export const useServiceLayerConfig = (): ServiceLayerConfig => {
  const config = useContext(ServiceLayerContext)
  if (!config) {
    throw new Error(
      "Service layer hooks must be used inside <ServiceLayerProvider>. " +
        "Wrap your app (or subtree) with the provider and supply a config."
    )
  }
  return config
}
