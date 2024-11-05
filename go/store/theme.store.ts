import type {} from "@redux-devtools/extension"
// required for devtools typing
import { create } from "zustand"
import { devtools, persist } from "zustand/middleware"

import { themeVariants } from "@/lib/types/theme"

interface themeState {
  theme: themeVariants
  toggleTheme: () => void
}

const useThemeStore = create<themeState>()(
  devtools(
    persist(
      set => ({
        theme: "light",
        toggleTheme: () =>
          set(state => ({
            theme: state.theme === "light" ? "dark" : "light",
          })),
      }),
      {
        name: "theme-storage",
      }
    )
  )
)

export { useThemeStore }
