import React from "react"

import Icon from "@/components/shared/icon/Icon"
import { cn } from "@/lib/helpers/helper.cn"

function WorkPageInfoBox({ text }: { text?: string }) {
  return (
    <div className="bg-background-overlay relative mr-auto flex items-center gap-4 rounded-md p-8 lg:mr-0 lg:w-auto">
      <Icon className={cn("top-4 left-4 h-5 w-5")} name="alert" />
      <h3 className="text-typo-link w-full">{text}</h3>
    </div>
  )
}

export default WorkPageInfoBox
