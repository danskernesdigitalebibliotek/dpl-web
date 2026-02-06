import React from "react"

import Icon from "@/components/shared/icon/Icon"
import { cn } from "@/lib/helpers/helper.cn"

function WorkPageInfoBox({ text }: { text?: string }) {
  return (
    <div
      className="bg-warning-orange-100 text-warning-orange-400 flex w-full items-center
        justify-center gap-4 rounded-sm px-5 py-4 lg:w-auto">
      <Icon className={cn("h-5 min-h-5 w-5 min-w-5")} name="alert" />
      <p className="text-typo-link">{text}</p>
    </div>
  )
}

export default WorkPageInfoBox
