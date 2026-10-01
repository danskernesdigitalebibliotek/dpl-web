"use client"

import type { WedoBooksSdkConfig } from "@danskernesdigitalebibliotek/dpl-wedobooks"
import { useContext } from "react"

import { DplCmsConfigContext } from "@/lib/providers/DplCmsConfigContextProvider"

// The WeDoBooks SDK configuration the CMS ships, or null when the site has
// none. GO counterpart to the react apps' useReaderSdkConfig: same contract
// (null means "this site cannot run the WeDoBooks reader"), but the values
// arrive through the CMS GraphQL configuration instead of data attributes.
// The CMS guarantees all-or-none, so no per-field blank check is needed here.
export const useBiblioSdkConfig = (): WedoBooksSdkConfig | null => {
  const dplCmsConfig = useContext(DplCmsConfigContext)

  return dplCmsConfig?.biblio.sdk ?? null
}
