import React from "react"

import { cn } from "@/lib/helpers/helper.cn"

import Icon from "../icon/Icon"

const MaterialTypeIconWrapper = ({
  iconName,
  costFree,
}: {
  iconName: "book" | "headphones" | "controller" | "video" | "podcast"
  costFree?: boolean
}) => {
  return (
    <div
      className={cn(
        "h-6 w-6 rounded-full md:h-10 md:w-10",
        costFree ? "bg-content-blue-50" : "bg-background-overlay"
      )}>
      <div className="flex h-full w-full items-center justify-center">
        <Icon className="h-full w-full" name={iconName} />
      </div>
    </div>
  )
}

export default MaterialTypeIconWrapper
