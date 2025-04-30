"use client"

import { createContext } from "react"

import useGetDplCmsLoginUrls from "../config/dpl-cms/useGetDplCmsLoginUrls"

export const ConfigContext = createContext<TConfig | null>(null)

type TConfig = {
  adgangsplatformenLoginUrl: string
}

export default function ConfigContextProvider({ children }: { children: React.ReactNode }) {
  const { adgangsplatformen: adgangsplatformenLoginUrl } = useGetDplCmsLoginUrls()

  const config = {
    adgangsplatformenLoginUrl: adgangsplatformenLoginUrl ?? "",
  }

  return <ConfigContext.Provider value={config}>{children}</ConfigContext.Provider>
}
