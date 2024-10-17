"use client"
import React, { useEffect } from "react"

import { useThemeStore } from "@/store/theme.store"

export default function Theme({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const { theme, userInteracted } = useThemeStore()

  useEffect(() => {
    if (userInteracted) {
      document.body.classList.add(userInteracted ? "user-interacted" : "")
    }

    if (theme === "dark") {
      document.body.classList.add("dark-mode")
    } else {
      document.body.classList.remove("dark-mode")
    }

    // unmount action
    return () => document.body.classList.remove("dark-mode")
  }, [theme, userInteracted])

  return children
}
