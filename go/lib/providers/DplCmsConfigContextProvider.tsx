"use client"

import { createContext } from "react"

import { TDplCmsPublicConfig } from "../config/dpl-cms/configSchemas"
import { useGetDplCmsPublicConfigurationQuery } from "../graphql/generated/dpl-cms/graphql"

export const DplCmsConfigContext = createContext<TDplCmsPublicConfig | null>(null)

export default function DplCmsConfigContextProvider({ children }: { children: React.ReactNode }) {
  const { data } = useGetDplCmsPublicConfigurationQuery()
  const goConfiguration = data?.goConfiguration?.public
    ? {
        loginUrls: {
          adgangsplatformen: data.goConfiguration.public.loginUrls?.adgangsplatformen ?? null,
        },
        logoutUrls: {
          adgangsplatformen: data.goConfiguration.public.logoutUrls?.adgangsplatformen ?? null,
        },
        libraryInfo: {
          name: data.goConfiguration.public.libraryInfo?.name ?? null,
        },
        unilogin: {
          municipalityId: data.goConfiguration.public.unilogin?.municipalityId ?? null,
        },
      }
    : null

  return (
    <DplCmsConfigContext.Provider value={goConfiguration || null}>
      {children}
    </DplCmsConfigContext.Provider>
  )
}
