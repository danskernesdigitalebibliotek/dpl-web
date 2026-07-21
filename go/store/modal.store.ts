import { createStore } from "@xstate/store"

import type { DeleteReservationModalProps } from "@/components/shared/deleteReservationModal/DeleteReservationModal"
import type { PlayerModalProps } from "@/components/shared/playerModal/playerModal"
import type { PlayerPreviewModalProps } from "@/components/shared/playerPreviewModal/playerPreviewModal"
import type { ReservationsModalProps } from "@/components/shared/reservationsModal/ReservationsModal"
import type { TModalUrlParams } from "@/lib/helpers/modal-url"

// Props per modal type — `open`/`onClose` are supplied by the DynamicModal
// host. The rule: modals open through this store; rich data props for
// in-page modals, `{wid, pid}` for the login-flow modals that must also be
// openable from the URL inbox after a redirect (they fetch internally).
export type TModalRegistry = {
  PlayerModal: PlayerModalProps
  PlayerPreviewModal: PlayerPreviewModalProps
  DeleteReservationModal: DeleteReservationModalProps
  ReservationsModal: ReservationsModalProps
} & TModalUrlParams

export type TModalStoreType = keyof TModalRegistry

type TContext = {
  open: boolean
  modalType: TModalStoreType | null
  props: TModalRegistry[TModalStoreType] | null
}

const modalStore = createStore({
  // Initial context
  context: {
    open: false,
    modalType: null,
    props: null,
  } as TContext,
  // Transitions
  on: {
    openModal: (
      context,
      event: { modalType: TModalStoreType; props: TModalRegistry[TModalStoreType] }
    ) => ({
      ...context,
      open: true,
      modalType: event.modalType,
      props: event.props,
    }),
    // Keeps modalType/props so the host can play the exit animation before
    // clearing the content.
    closeModal: context => ({
      ...context,
      open: false,
    }),
  },
})

// Typed wrapper so call sites get per-modal prop checking.
export const openModal = <T extends TModalStoreType>(modalType: T, props: TModalRegistry[T]) =>
  modalStore.trigger.openModal({ modalType, props })

export const closeModal = () => modalStore.trigger.closeModal()

export { modalStore }
