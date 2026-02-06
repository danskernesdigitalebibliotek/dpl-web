import React, { ButtonHTMLAttributes } from "react"

import { cn } from "@/lib/helpers/helper.cn"

type BadgeButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
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
  ...restProps
}: BadgeButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        `focus-visible bg-background-overlay text-typo-caption flex h-[28px] w-auto flex-row
        justify-center gap-2 self-start rounded-full px-4 py-2 whitespace-nowrap
        hover:cursor-pointer`,
        withAnimation ? "hover:animate-wiggle" : "",
        variant === "transparent" ? "bg-transparent" : "",
        isActive ? "bg-foreground text-background" : "",
        classNames
      )}
      aria-label={ariaLabel}
      {...restProps}>
      {children}
    </button>
  )
}

export default BadgeButton
