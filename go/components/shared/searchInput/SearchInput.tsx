import * as React from "react"

import { cn } from "@/lib/utils"

import Icon from "../icon/Icon"

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const SearchInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <input
          type={type}
          className={cn(
            `text-sm file:text-sm placeholder:muted-foreground flex h-20 w-full rounded-base
            bg-background-overlay px-5 text-typo-subtitle-lg shadow-sm transition-colors file:border-0
            file:bg-transparent file:font-medium file:text-foreground focus-visible:outline-none
            focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50`,
            className
          )}
          ref={ref}
          {...props}
        />
        <div className="absolute right-[24px] top-[50%] translate-y-[-50%]">
          <Icon className="h-[32px] w-[32px]" name="search" />
        </div>
      </div>
    )
  }
)
SearchInput.displayName = "SearchInput"

export { SearchInput }
