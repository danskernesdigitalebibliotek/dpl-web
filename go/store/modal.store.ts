import { createStore } from "@xstate/store"

import { ModalComponentTypes } from "@/components/shared/dynamicModal/DynamicModal"

type TModalTypes = keyof typeof ModalComponentTypes | null
type TPropsObject = object | null

type TContext = {
  open: boolean
  modalType: TModalTypes
  props?: TPropsObject
}

const modalStore = createStore({
  // Initial context
  context: {
    modalType: null,
    open: false,
    props: null,
  } as TContext,
  // Transitions
  on: {
    openModal: (
      context,
      { modalType, props }: { modalType: TModalTypes; props?: TPropsObject }
    ) => ({
      ...context,
      open: true,
      modalType: modalType,
      props: props,
    }),
    closeModal: context => ({
      ...context,
      open: false,
    }),
  },
})

export { modalStore }
