"use client"

import React from "react"

import Icon from "@/components/shared/icon/Icon"
import { cn } from "@/lib/helpers/helper.cn"
import { useThemeStore } from "@/store/theme.store"

function DarkModeToggle() {
  const { theme, toggleTheme } = useThemeStore()

  return (
    <button
      onClick={() => toggleTheme()}
      aria-label="Skift mellem 'light mode' og 'dark mode'"
      className="focus-visible relative inline-flex h-[40px] w-[75px] items-center whitespace-nowrap rounded-full
        border border-foreground px-[3px] text-typo-button-lg uppercase text-foreground shadow-button
        transition disabled:pointer-events-none disabled:opacity-50">
      <div
        className={cn(
          "relative h-[32px] w-[32px] rounded-full bg-foreground transition-transform duration-300 ease-out",
          theme === "dark" ? "translate-x-[calc(100%+3px)]" : ""
        )}>
        <Icon
          className={cn(
            "absolute left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] transition-all duration-500",
            theme === "dark" ? "opacity-0" : "opacity-100"
          )}
          name="sun"
        />
        <Icon
          className={cn(
            "absolute left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] transition-all duration-500",
            theme === "dark" ? "opacity-100" : "opacity-0"
          )}
          name="moon"
        />
      </div>
    </button>
  )
}

export default DarkModeToggle
