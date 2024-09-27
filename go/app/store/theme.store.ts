import type {} from "@redux-devtools/extension"; // required for devtools typing
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

interface themeState {
  theme: "light" | "dark";
  userInteracted: boolean;
  toggleTheme: () => void;
}

const useThemeStore = create<themeState>()(
  devtools(
    persist(
      (set) => ({
        theme: "light",
        toggleTheme: () =>
          set((state) => ({
            theme: state.theme === "light" ? "dark" : "light",
            userInteracted: true
          })),
        userInteracted: false
      }),
      {
        name: "theme-storage"
      }
    )
  )
);

export { useThemeStore };
