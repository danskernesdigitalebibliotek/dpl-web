import { createStore } from "@xstate/store"

type TThemeTypes = "light" | "dark"

type TContext = {
  theme: TThemeTypes
}

const savedSnapshot = localStorage.getItem("theme.store")
const initialSnapshot = savedSnapshot
  ? JSON.parse(savedSnapshot)
  : {
      context: {
        theme: "light",
      } as TContext,
    }

const themeStore = createStore({
  context: initialSnapshot.context as TContext,
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
