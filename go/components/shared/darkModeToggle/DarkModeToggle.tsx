"use client"

import React from "react"

import Icon from "@/components/shared/icon/Icon"
import { useThemeStore } from "@/store/theme.store"

function DarkModeToggle() {
  const { theme, toggleTheme } = useThemeStore()

  return (
    <button onClick={toggleTheme}>
      <Icon
        className="h-[40px] hover:translate-x-[2px] hover:translate-y-[2px]"
        name={theme === "light" ? "toggle-day" : "toggle-night"}
      />
    </button>
  )
}

export default DarkModeToggle
