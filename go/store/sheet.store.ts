import { create } from "zustand"

import { SheetContentComponentTypes } from "@/components/shared/dynamicSheet/DynamicSheet"

type TSheetTypes = keyof typeof SheetContentComponentTypes | null

type themeState = {
  open: boolean
  sheetType: TSheetTypes
  openSheet: (params: { sheetType: TSheetTypes }) => void
  closeSheet: () => void
}

const useSheetStore = create<themeState>()(set => ({
  sheetType: null,
  open: false,
  openSheet: ({ sheetType }: { sheetType: TSheetTypes }) =>
    set(() => ({
      open: true,
      sheetType: sheetType,
    })),
  closeSheet: () =>
    set({
      open: false,
    }),
}))

export { useSheetStore }
