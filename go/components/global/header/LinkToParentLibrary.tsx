import React from "react"

import SmartLink from "@/components/shared/smartLink/SmartLink"
import { getDplCmsPublicConfig } from "@/lib/config/dpl-cms/dplCmsConfig"
import { getEnv } from "@/lib/config/env"
import { cn } from "@/lib/helpers/helper.cn"

export type LinkToParentLibraryProps = {
  className?: string
}

const LinkToParentLibrary = async ({ className }: LinkToParentLibraryProps) => {
  const { libraryInfo: { name: libraryName = null } = {} } = await getDplCmsPublicConfig()
  const parentLibraryUrl = getEnv("DPL_CMS_HOSTNAME")

  return (
    <p className={cn("text-typo-caption", className)}>
      En del af{" "}
      <SmartLink
        className="animate-text-underline"
        linkType="external"
        href={parentLibraryUrl}
        target="_blank">
        {libraryName || "dit lokale bibliotek"}
      </SmartLink>
    </p>
  )
}

export default LinkToParentLibrary
