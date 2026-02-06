"use client"

import { useSelector } from "@xstate/react"
import React, { useEffect } from "react"

import { useDarkMode, useLightMode } from "@/lib/helpers/helper.theme"
import { themeStore } from "@/store/theme.store"

//determines if the user has a set theme
function useDetectColorScheme() {
  const theme = useSelector(themeStore, state => state.context.theme)

  //local storage is used to override OS theme settings
  if (theme) {
    return theme
  } else if (!window?.matchMedia) {
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
  const darkMode = useDarkMode
  const lightMode = useLightMode

  useEffect(() => {
    if (theme == "dark") {
      darkMode()
    } else {
      lightMode()
    }
  }, [theme, darkMode, lightMode])

  return children
}
