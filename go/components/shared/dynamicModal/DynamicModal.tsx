"use client"

import { useSelector } from "@xstate/react"
import { usePathname } from "next/navigation"
import { useQueryStates } from "nuqs"
import React, { useEffect, useRef, useState } from "react"

import ReservationsModal from "@/components/shared/reservationsModal/ReservationsModal"
import { TModalType, VALID_MODAL_TYPES, modalParsers } from "@/lib/helpers/modal-url"
import {
  TModalRegistry,
  TModalStoreType,
  closeModal,
  modalStore,
  openModal,
} from "@/store/modal.store"

import DeleteReservationModal from "../deleteReservationModal/DeleteReservationModal"
import LoanLoginModal from "../loanLoginModal/LoanLoginModal"
import LoanMaterialModal from "../loanMaterialModal/LoanMaterialModal"
import PlayerModal from "../playerModal/playerModal"
import PlayerPreviewModal from "../playerPreviewModal/playerPreviewModal"
import ReservationLoginModal from "../reservationModal/ReservationLoginModal"
import ReservationModal from "../reservationModal/ReservationModal"
import ReservationUniloginModal from "../reservationModal/ReservationUniloginModal"

const ModalComponents: {
  [K in TModalStoreType]: React.ComponentType<
    TModalRegistry[K] & { open: boolean; onClose: () => void }
  >
} = {
  PlayerModal,
  PlayerPreviewModal,
  DeleteReservationModal,
  ReservationsModal,
  LoanMaterialModal,
  LoanLoginModal,
  ReservationModal,
  ReservationLoginModal,
  ReservationUniloginModal,
}

// Opens a modal from URL query params and strips them right away — the way
// external flows hand a modal over to the store. The case that needs this:
// a user tries to loan without being logged in, logs in, and the redirect
// lands here with the loan modal in the URL so it can reopen. Stripping is
// deliberate: the params are a one-shot handover, not state — if they stayed,
// the modal would become part of history/bookmarks and reopen on
// back-navigation or page restore.
function ModalUrlListener() {
  const [{ modal, modalProps }, setModal] = useQueryStates(modalParsers, {
    scroll: false,
    history: "replace",
  })

  useEffect(() => {
    if (!modal || !VALID_MODAL_TYPES.has(modal) || !modalProps?.wid || !modalProps?.pid) return
    openModal(modal as TModalType, { wid: modalProps.wid, pid: modalProps.pid })
    setModal({ modal: null, modalProps: null })
  }, [modal, modalProps, setModal])

  return null
}

// Renders the modal opened through the modal store. Keeps the closing modal
// mounted until its exit animation has played, and closes on route changes —
// the store outlives page navigations. Exported so stories can mount the
// store-driven host without the nuqs-dependent URL listener.
export function StoreModal() {
  const { open, modalType, props } = useSelector(modalStore, state => state.context)
  const [active, setActive] = useState<{
    modalType: TModalStoreType
    props: TModalRegistry[TModalStoreType]
  } | null>(null)
  // The modal mounts closed and opens on the next frame, so the enter
  // animation plays from a fully committed tree instead of the dialog
  // painting empty (a blank full-size flash) on mount.
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (open && modalType && props) {
      setActive({ modalType, props })
      const frame = requestAnimationFrame(() => setVisible(true))
      return () => cancelAnimationFrame(frame)
    } else {
      setVisible(false)
      const timer = setTimeout(() => setActive(null), 500)
      return () => clearTimeout(timer)
    }
  }, [open, modalType, props])

  const pathname = usePathname()
  const previousPathname = useRef(pathname)
  useEffect(() => {
    if (previousPathname.current !== pathname) {
      previousPathname.current = pathname
      closeModal()
    }
  }, [pathname])

  if (!active) return null

  const ModalComponent = ModalComponents[active.modalType] as React.ComponentType<
    TModalRegistry[TModalStoreType] & { open: boolean; onClose: () => void }
  >
  return <ModalComponent open={open && visible} onClose={closeModal} {...active.props} />
}

export function DynamicModal() {
  return (
    <>
      <ModalUrlListener />
      <StoreModal />
    </>
  )
}
