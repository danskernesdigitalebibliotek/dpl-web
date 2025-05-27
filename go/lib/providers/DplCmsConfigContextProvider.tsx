"use client"

import React, { createContext } from "react"

import { TDplCmsPublicConfig } from "../config/dpl-cms/configSchemas"

export const DplCmsConfigContext = createContext<TDplCmsPublicConfig | null>(null)

function DplCmsConfigContextProvider({
  dplCmsConfig,
  children,
}: {
  dplCmsConfig: TDplCmsPublicConfig
  children: React.ReactNode
}) {
  return (
    <DplCmsConfigContext.Provider value={dplCmsConfig}>{children}</DplCmsConfigContext.Provider>
  )
}

export default DplCmsConfigContextProvider
