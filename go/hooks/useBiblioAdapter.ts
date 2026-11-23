"use client"

import { useContext } from "react"

import { isBiblioAdapterActive } from "@/lib/helpers/helper.biblio"
import { DplCmsConfigContext } from "@/lib/providers/DplCmsConfigContextProvider"

// Mirrors the react apps' useBiblioAdapter, but reads the CMS GraphQL
// configuration instead of a data attribute. See isBiblioAdapterActive.
export const useBiblioAdapter = (): boolean => {
  const dplCmsConfig = useContext(DplCmsConfigContext)

  return isBiblioAdapterActive(dplCmsConfig?.biblio)
}
