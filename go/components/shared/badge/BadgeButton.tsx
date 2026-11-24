import { motion } from "framer-motion"
import React, { ButtonHTMLAttributes, forwardRef } from "react"

import { pillHover, pillTap } from "@/components/shared/pillButton/PillButton"
import { cn } from "@/lib/helpers/helper.cn"

// The handlers framer-motion redefines; React's versions would clash with it.
type ConflictingMotionProps =
  | "onDrag"
  | "onDragStart"
  | "onDragEnd"
  | "onAnimationStart"
  | "onAnimationEnd"
  | "onAnimationIteration"

type BadgeButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, ConflictingMotionProps> & {
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
      <motion.button
        ref={ref}
        onClick={onClick}
        whileHover={withAnimation ? pillHover : undefined}
        whileTap={withAnimation ? pillTap : undefined}
        className={cn(
          `focus-visible bg-background-overlay text-typo-caption flex h-[28px] w-auto flex-row
          justify-center gap-2 self-start rounded-full px-4 py-2 whitespace-nowrap
          hover:cursor-pointer`,
          variant === "transparent" ? "bg-transparent" : "",
          isActive ? "bg-foreground text-background" : "",
          classNames
        )}
        aria-label={ariaLabel}
        aria-pressed={isActive}
        {...restProps}>
        <span className="flex flex-row items-center gap-2">{children}</span>
      </motion.button>
    )
  }
)

BadgeButton.displayName = "BadgeButton"

export default BadgeButton
