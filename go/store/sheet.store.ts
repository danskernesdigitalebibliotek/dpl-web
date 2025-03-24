import { createStore } from "@xstate/store"

import { SheetContentComponentTypes } from "@/components/shared/dynamicSheet/DynamicSheet"

type TSheetTypes = keyof typeof SheetContentComponentTypes | null
type TPropsObject = object | null

type TContext = {
  open: boolean
  sheetType: TSheetTypes
  props?: TPropsObject
}

const sheetStore = createStore({
  // Initial context
  context: {
    sheetType: null,
    open: false,
    props: null,
  } as TContext,
  // Transitions
  on: {
    openSheet: (
      context,
      { sheetType, props }: { sheetType: TSheetTypes; props?: TPropsObject }
    ) => ({
      ...context,
      open: true,
      sheetType: sheetType,
      props: props,
    }),
    closeSheet: context => ({
      ...context,
      open: false,
    }),
  },
})

export { sheetStore }
