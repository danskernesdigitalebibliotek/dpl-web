"use client"

import React, { useContext } from "react"

import SmartLink from "@/components/shared/smartLink/SmartLink"
import { getEnv } from "@/lib/config/env"
import { cn } from "@/lib/helpers/helper.cn"
import { DplCmsConfigContext } from "@/lib/providers/DplCmsConfigContextProvider"

export type LinkToParentLibraryProps = {
  className?: string
}

const LinkToParentLibrary = ({ className }: LinkToParentLibraryProps) => {
  const dplCmsConfig = useContext(DplCmsConfigContext)
  const parentLibraryUrl = getEnv("DPL_CMS_HOSTNAME")

  return (
    <p className={cn("text-typo-caption", className)}>
      En del af{" "}
      <SmartLink
        className="animate-text-underline"
        linkType="external"
        href={parentLibraryUrl}
        target="_blank">
        {dplCmsConfig?.libraryInfo.name || "dit lokale bibliotek"}
      </SmartLink>
    </p>
  )
}

export default LinkToParentLibrary
