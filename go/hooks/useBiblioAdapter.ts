"use client"

import { useContext } from "react"

import { DplCmsConfigContext } from "@/lib/providers/DplCmsConfigContextProvider"

// Whether digital materials go through the Biblio adapter (the service
// layer) rather than straight to Publizon, which remains the default.
// Mirrors the react apps' useBiblioAdapter, but reads the CMS GraphQL
// configuration instead of a data attribute. Only active when the whole
// configuration is in place — the flag alone cannot run the reader/player.
export const useBiblioAdapter = (): boolean => {
  const dplCmsConfig = useContext(DplCmsConfigContext)
  const biblio = dplCmsConfig?.biblio

  return Boolean(biblio?.enabled && biblio.baseUrl && biblio.sdk)
}

// The answer a Unilogin user gets when trying to loan a digital material
// with the adapter on: Unilogin cannot authenticate against the Biblio
// adapter, and there is no Publizon fallback for new loans. Sampling is not
// affected — it needs no session. Child friendly — GO's audience is students.
export const uniloginDigitalLoanErrorText =
  "Øv! Du kan ikke låne digitale bøger og lydbøger, når du er logget ind med Unilogin."
