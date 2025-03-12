import { create } from "zustand"

import { SheetContentComponentTypes } from "@/components/shared/dynamicSheet/DynamicSheet"

type TSheetTypes = keyof typeof SheetContentComponentTypes | null

type themeState = {
  open: boolean
  sheetType: TSheetTypes
  props?: object | null
  openSheet: (params: { sheetType: TSheetTypes; props?: object }) => void
  closeSheet: () => void
}

const useSheetStore = create<themeState>()(set => ({
  sheetType: null,
  open: false,
  props: null,
  openSheet: ({ sheetType, props }: { sheetType: TSheetTypes; props?: object }) =>
    set(() => ({
      open: true,
      sheetType: sheetType,
      props: props,
    })),
  closeSheet: () =>
    set({
      open: false,
    }),
}))

export { useSheetStore }
