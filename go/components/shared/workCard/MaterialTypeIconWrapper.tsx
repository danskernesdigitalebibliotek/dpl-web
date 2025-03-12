import React from "react"

import { cn } from "@/lib/helpers/helper.cn"

import Icon from "../icon/Icon"

export type MaterialTypeIconWrapperProps = {
  iconName: "book" | "headphones" | "controller" | "video" | "podcast"
  costFree?: boolean
  className?: string
}

const MaterialTypeIconWrapper = ({
  iconName,
  costFree,
  className,
}: MaterialTypeIconWrapperProps) => {
  return (
    <div
      className={cn(
        "h-6 w-6 rounded-full md:h-10 md:w-10",
        costFree ? "bg-content-blue-50" : "bg-background-overlay",
        className
      )}>
      <div className="flex h-full w-full items-center justify-center">
        <Icon className="h-full w-full" name={iconName} />
      </div>
    </div>
  )
}

export default MaterialTypeIconWrapper
