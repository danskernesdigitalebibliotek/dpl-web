"use client"

import React from "react"

import SmartLink from "@/components/shared/smartLink/SmartLink"
import useDplCmsPublicConfig from "@/lib/config/dpl-cms/useDplCmsPublicConfig"
import { getEnv } from "@/lib/config/env"
import { cn } from "@/lib/helpers/helper.cn"

export type LinkToParentLibraryProps = {
  className?: string
}

const LinkToParentLibrary = ({ className }: LinkToParentLibraryProps) => {
  const { config, isLoading } = useDplCmsPublicConfig()
  const parentLibraryUrl = getEnv("DPL_CMS_HOSTNAME")
  const libraryName = config?.libraryInfo?.name ?? "dit lokale bibliotek"

  if (isLoading !== false) {
    return <p className={cn("text-typo-caption", className)}>En del af...</p>
  }

  return (
    <p className={cn("text-typo-caption", className)}>
      En del af{" "}
      {parentLibraryUrl ? (
        <SmartLink
          className="animate-text-underline"
          linkType="external"
          href={parentLibraryUrl}
          target="_blank">
          {libraryName}
        </SmartLink>
      ) : (
        libraryName
      )}
    </p>
  )
}

export default LinkToParentLibrary
