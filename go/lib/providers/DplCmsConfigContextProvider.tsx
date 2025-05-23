"use client"

import { createContext } from "react"

import { TDplCmsPublicConfig } from "../config/dpl-cms/configSchemas"

export const DplCmsConfigContext = createContext<TDplCmsPublicConfig | null>(null)

export default function DplCmsConfigContextProvider({
  children,
  config,
}: {
  children: React.ReactNode
  config: TDplCmsPublicConfig | null
}) {
  return (
    <DplCmsConfigContext.Provider value={config ?? null}>{children}</DplCmsConfigContext.Provider>
  )
}
