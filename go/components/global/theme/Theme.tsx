"use client"

import React, { useEffect } from "react"

import { addDarkMode, removeDarkMode } from "@/lib/helpers/helper.theme"
import { useThemeStore } from "@/store/theme.store"

//determines if the user has a set theme
function useDetectColorScheme() {
  const { theme } = useThemeStore()

  //local storage is used to override OS theme settings
  if (theme) {
    return theme
  } else if (!window.matchMedia) {
    //matchMedia method not supported
    return "light"
  } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    //OS theme setting detected as dark
    return "dark"
  }
}

export default function Theme({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const theme = useDetectColorScheme()

  useEffect(() => {
    if (theme == "dark") {
      addDarkMode()
    } else {
      removeDarkMode()
    }

    // unmount action
    return () => document.body.classList.remove("dark-mode")
  }, [theme])

  return children
}
