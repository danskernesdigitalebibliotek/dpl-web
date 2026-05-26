import React, { ButtonHTMLAttributes, forwardRef } from "react"

import { cn } from "@/lib/helpers/helper.cn"

type BadgeButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  isActive?: boolean
  classNames?: string
  children: React.ReactNode
  ariaLabel: string
  variant?: "default" | "transparent"
  withAnimation?: boolean
}

const BadgeButton = forwardRef<HTMLButtonElement, BadgeButtonProps>(
  (
    {
      onClick,
      isActive = false,
      classNames,
      children,
      ariaLabel,
      variant = "default",
      withAnimation = false,
      ...restProps
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
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
        aria-pressed={isActive}
        {...restProps}>
        {children}
      </button>
    )
  }
)

BadgeButton.displayName = "BadgeButton"

export default BadgeButton
