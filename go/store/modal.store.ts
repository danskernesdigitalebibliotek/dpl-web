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
    closeModal: context => {
      // Reset the modal after a short delay to allow for animations
      setTimeout(() => {
        modalStore.send({ type: "resetModal" })
      }, 500)

      return {
        ...context,
        open: false,
      }
    },
    resetModal: context => ({
      ...context,
      modalType: null,
      props: null,
    }),
  },
})

export { modalStore }
