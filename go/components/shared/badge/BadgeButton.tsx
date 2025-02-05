import React from "react"

import { cn } from "@/lib/helpers/helper.cn"

type BadgeButtonProps = {
  onClick: () => void
  isActive?: boolean
  classNames?: string
  children: React.ReactNode
  ariaLabel: string
  variant?: "default" | "transparent"
  withAnimation?: boolean
}

const BadgeButton = ({
  onClick,
  isActive = false,
  classNames,
  children,
  ariaLabel,
  variant = "default",
  withAnimation = false,
}: BadgeButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        `focus-visible bg-background-overlay text-typo-caption flex h-[28px] w-auto flex-row justify-center
        gap-2 self-start rounded-full px-4 py-2 whitespace-nowrap`,
        withAnimation ? "hover:animate-wiggle" : "",
        variant === "transparent" ? "bg-transparent" : "",
        isActive ? "bg-foreground text-background" : "",
        classNames
      )}
      aria-label={ariaLabel}>
      {children}
    </button>
  )
}

export default BadgeButton
