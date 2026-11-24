import { motion } from "framer-motion"
import React, { ButtonHTMLAttributes, forwardRef } from "react"

import { cn } from "@/lib/helpers/helper.cn"

// The movement every pill shares: grow under the pointer, shrink on press.
export const pillHover = { scale: 1.06 }
export const pillTap = { scale: 0.92 }

// The handlers framer-motion redefines; React's versions would clash with it.
type ConflictingMotionProps =
  | "onDrag"
  | "onDragStart"
  | "onDragEnd"
  | "onAnimationStart"
  | "onAnimationEnd"
  | "onAnimationIteration"

export type PillButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  ConflictingMotionProps
> & {
  children: React.ReactNode
  classNames?: string
}

// The pill shape and its movement. Callers pass selected colours through
// classNames.
const PillButton = forwardRef<HTMLButtonElement, PillButtonProps>(
  ({ children, classNames, type = "button", ...restProps }, ref) => {
    return (
      <motion.button
        ref={ref}
        type={type}
        whileHover={pillHover}
        whileTap={pillTap}
        className={cn(
          `focus-visible text-typo-label-sm relative flex flex-row items-center gap-2 rounded-full
          px-4 py-2 whitespace-nowrap hover:cursor-pointer`,
          classNames
        )}
        {...restProps}>
        {children}
      </motion.button>
    )
  }
)

PillButton.displayName = "PillButton"

export default PillButton
