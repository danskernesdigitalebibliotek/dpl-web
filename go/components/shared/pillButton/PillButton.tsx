import React, { ButtonHTMLAttributes, forwardRef } from "react"

import { cn } from "@/lib/helpers/helper.cn"

export type PillButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode
  classNames?: string
}

// The pill shape on its own: no state, no animation. Callers wrap it in
// motion() to move it and pass selected colours through classNames.
const PillButton = forwardRef<HTMLButtonElement, PillButtonProps>(
  ({ children, classNames, type = "button", ...restProps }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          `focus-visible text-typo-label-sm relative flex flex-row items-center gap-2 rounded-full
          px-4 py-2 whitespace-nowrap hover:cursor-pointer`,
          classNames
        )}
        {...restProps}>
        {children}
      </button>
    )
  }
)

PillButton.displayName = "PillButton"

export default PillButton
