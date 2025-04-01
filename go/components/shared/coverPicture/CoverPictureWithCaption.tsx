import React from "react"

import { cn } from "@/lib/helpers/helper.cn"

type CoverPictureWithCaptionProps = {
  className?: string
  children: React.ReactNode
  caption: string
}

const CoverPictureWithCaption = ({
  className,
  children,
  caption,
}: CoverPictureWithCaptionProps) => {
  return (
    <div className={cn("block h-full w-full space-y-3 px-[15%]", className)}>
      <div className="reltive h-[85%]">{children}</div>
      <p className="text-typo-subtitle-sm break-words opacity-50">{caption}</p>
    </div>
  )
}

export default CoverPictureWithCaption
