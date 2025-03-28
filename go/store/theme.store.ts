"use client"

import { createStore } from "@xstate/store"

type TThemeTypes = "light" | "dark"

type TContext = {
  theme: TThemeTypes
}

const initialSnapshot =
  typeof window !== "undefined" && JSON.parse(localStorage.getItem("theme.store") || "")

const themeStore = createStore({
  context: initialSnapshot.context || ({ theme: "light" } as TContext),
  on: {
    toggleTheme: context => ({
      ...context,
      theme: (context.theme === "dark" ? "light" : "dark") as TThemeTypes,
    }),
  },
})

// Handle persistence via subscription - persist entire snapshot
themeStore.subscribe(snapshot => {
  localStorage.setItem("theme.store", JSON.stringify(snapshot))
})

export { themeStore }
