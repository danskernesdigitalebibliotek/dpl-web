import React from "react"

import { cn } from "@/lib/helpers/helper.cn"

type BadgeButtonProps = {
  onClick: () => void
  isActive?: boolean
  classNames?: string
  children: React.ReactNode
}

const BadgeButton = ({ onClick, isActive = false, classNames, children }: BadgeButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        `focus-visible h-[28px] w-auto self-start whitespace-nowrap rounded-full bg-background-overlay px-4
        py-2 text-typo-caption hover:animate-wiggle`,
        isActive && "bg-foreground text-background",
        classNames
      )}>
      {children}
    </button>
  )
}

export default BadgeButton
