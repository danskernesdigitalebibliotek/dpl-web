import type {} from "@redux-devtools/extension"
// required for devtools typing
import { create } from "zustand"
import { devtools, persist } from "zustand/middleware"

import { ManifestationWorkPageFragment } from "@/lib/graphql/generated/fbi/graphql"

type SelectedManifestationState = {
  selectedManifestation: ManifestationWorkPageFragment | null
  setSelectedManifestation: (manifestation: ManifestationWorkPageFragment) => void
}

const useSelectedManifestationStore = create<SelectedManifestationState>()(
  devtools(
    persist(
      set => ({
        selectedManifestation: null,
        setSelectedManifestation: manifestation =>
          set(() => ({
            selectedManifestation: manifestation,
          })),
      }),
      {
        name: "theme-storage",
      }
    )
  )
)

export { useSelectedManifestationStore }
