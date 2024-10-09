import * as React from "react";

import { cn } from "@/lib/utils";

import Icon from "../icon/Icon";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const SearchInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <div className="w-full relative">
        <input
          type={type}
          className={cn(
            "flex h-20 px-5 rounded-base w-full bg-background-foreground text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 text-typo-subtitle-lg",
            className
          )}
          ref={ref}
          {...props}
        />
        <div className="absolute right-[24px] top-[50%] translate-y-[-50%]">
          <Icon className="w-[32px] h-[32px]" name="search" />
        </div>
      </div>
    );
  }
);
SearchInput.displayName = "SearchInput";

export { SearchInput };
