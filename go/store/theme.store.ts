import type {} from "@redux-devtools/extension"
// required for devtools typing
import { create } from "zustand"
import { devtools, persist } from "zustand/middleware"

interface themeState {
  theme: "light" | "dark" | undefined
  toggleTheme: () => void
}

const useThemeStore = create<themeState>()(
  devtools(
    persist(
      set => ({
        theme: undefined,
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
