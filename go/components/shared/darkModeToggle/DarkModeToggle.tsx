"use client"

import { useSelector } from "@xstate/react"
import React from "react"

import Icon from "@/components/shared/icon/Icon"
import { cn } from "@/lib/helpers/helper.cn"
import { themeStore } from "@/store/theme.store"

function DarkModeToggle() {
  const { toggleTheme } = themeStore.trigger
  const theme = useSelector(themeStore, state => state.context.theme)

  return (
    <button
      onClick={() => toggleTheme()}
      aria-label="Skift mellem 'light mode' og 'dark mode'"
      className="focus-visible border-foreground text-typo-button-lg text-foreground shadow-button
        relative inline-flex h-[40px] w-[75px] items-center rounded-full border px-[3px]
        whitespace-nowrap uppercase transition hover:cursor-pointer disabled:pointer-events-none
        disabled:opacity-50">
      <div
        className={cn(
          `bg-foreground relative h-[32px] w-[32px] rounded-full transition-transform duration-300
          ease-out`,
          theme === "dark" ? "translate-x-[calc(100%+3px)]" : ""
        )}>
        <Icon
          className={cn(
            `absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] transition-all
            duration-500`,
            theme === "dark" ? "opacity-0" : "opacity-100"
          )}
          name="sun"
        />
        <span className="sr-only">{theme}</span>
        <Icon
          className={cn(
            `absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] transition-all
            duration-500`,
            theme === "dark" ? "opacity-100" : "opacity-0"
          )}
          name="moon"
        />
      </div>
    </button>
  )
}

export default DarkModeToggle
