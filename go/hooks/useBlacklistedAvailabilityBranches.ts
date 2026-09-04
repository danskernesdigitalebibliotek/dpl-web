"use client"

import { useContext } from "react"

import { DplCmsConfigContext } from "@/lib/providers/DplCmsConfigContextProvider"

// Branch ids the library excludes from availability calculations, exposed by
// the CMS via goConfiguration.public. Client counterpart to reading
// getDplCmsPublicConfig() on the server. Empty array when unconfigured.
export const useBlacklistedAvailabilityBranches = (): string[] => {
  const dplCmsConfig = useContext(DplCmsConfigContext)
  return dplCmsConfig?.blacklistedAvailabilityBranches ?? []
}
