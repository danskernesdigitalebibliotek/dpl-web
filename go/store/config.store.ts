import type {} from "@redux-devtools/extension"
// required for devtools typing
import { create } from "zustand"
import { devtools, persist } from "zustand/middleware"

import { UniloginConfiguration } from "@/lib/graphql/generated/dpl-cms/graphql"

interface configState {
  uniloginConfig: UniloginConfiguration
  setUniloginConfig: (uniloginConfig: UniloginConfiguration) => void
}

const useConfigStore = create<configState>()(
  devtools(
    persist(
      set => ({
        uniloginConfig: {},
        setUniloginConfig: (uniloginConfig: UniloginConfiguration) => set({ uniloginConfig }),
      }),
      {
        name: "uniLogin-storage",
      }
    )
  )
)

export { useConfigStore }
