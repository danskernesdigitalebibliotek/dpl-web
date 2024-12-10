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
        `focus-visible flex h-[28px] w-auto flex-row justify-center gap-2 self-start whitespace-nowrap
        rounded-full bg-background-overlay px-4 py-2 text-typo-caption`,
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
