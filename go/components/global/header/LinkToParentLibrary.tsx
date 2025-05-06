"use client"

import React, { useContext } from "react"

import SmartLink from "@/components/shared/smartLink/SmartLink"
import { getEnv } from "@/lib/config/env"
import { DplCmsConfigContext } from "@/lib/providers/DplCmsConfigContextProvider"

const LinkToParentLibrary = () => {
  const dplCmsConfig = useContext(DplCmsConfigContext)
  const parentLibraryUrl = getEnv("DPL_CMS_HOSTNAME")

  return (
    <p className="text-typo-caption">
      En del af{" "}
      <SmartLink
        className="animate-text-underline"
        linkType="external"
        href={parentLibraryUrl}
        target="_blank">
        {dplCmsConfig?.libraryInfo.name}
      </SmartLink>
    </p>
  )
}

export default LinkToParentLibrary
