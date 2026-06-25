"use client"

import { useQueryStates } from "nuqs"
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react"

import {
  TModalType,
  TModalUrlParams,
  VALID_MODAL_TYPES,
  modalParsers,
} from "@/lib/helpers/modal-url"

import LoanMaterialModal from "../loanMaterialModal/LoanMaterialModal"
import PlayerModal from "../playerModal/playerModal"
import PlayerPreviewModal from "../playerPreviewModal/playerPreviewModal"

export function DynamicModal() {
  const [{ modal, modalProps }, setModal] = useQueryStates(modalParsers, { scroll: false })

  const modalType = modal && VALID_MODAL_TYPES.has(modal) ? (modal as TModalType) : null
  const wid = modalProps?.wid ?? null
  const pid = modalProps?.pid ?? null

  const [open, setOpen] = useState(!!modalType)
  const [activeModal, setActiveModal] = useState<TModalType | null>(modalType)
  const [activeParams, setActiveParams] = useState<TModalUrlParams[TModalType] | null>(modalProps)
  const triggerRef = useRef<HTMLElement | null>(null)

  // Capture the trigger element in a layout effect (before paint) so
  // document.activeElement still points at the button that opened the
  // modal.  A regular useEffect runs after paint, by which time
  // nuqs / Next.js may have shifted focus via startTransition.
  useLayoutEffect(() => {
    if (modalType && wid && pid) {
      triggerRef.current = document.activeElement as HTMLElement
    }
  }, [modalType, wid, pid])

  useEffect(() => {
    if (modalType && wid && pid) {
      setActiveModal(modalType)
      setActiveParams({ wid, pid })
      setOpen(true)
    } else {
      setOpen(false)
      const timer = setTimeout(() => setActiveModal(null), 500)
      return () => clearTimeout(timer)
    }
  }, [modalType, wid, pid])

  // Restore focus after the modal fully unmounts.  Passive effects run
  // after all cleanup effects, so Radix's deferred FocusScope cleanup
  // (which fires in a setTimeout(0)) has already executed by this point.
  useEffect(() => {
    if (!activeModal && triggerRef.current) {
      triggerRef.current.focus()
      triggerRef.current = null
    }
  }, [activeModal])

  const closeModal = useCallback(() => {
    setModal({ modal: null, modalProps: null })
  }, [setModal])

  if (!activeModal || !activeParams) return null

  if (activeModal === "LoanMaterialModal") {
    return (
      <LoanMaterialModal
        open={open}
        onClose={closeModal}
        wid={activeParams.wid}
        pid={activeParams.pid}
      />
    )
  }

  if (activeModal === "PlayerPreviewModal") {
    return (
      <PlayerPreviewModal
        open={open}
        onClose={closeModal}
        wid={activeParams.wid}
        pid={activeParams.pid}
      />
    )
  }

  if (activeModal === "PlayerModal") {
    return (
      <PlayerModal open={open} onClose={closeModal} wid={activeParams.wid} pid={activeParams.pid} />
    )
  }

  return null
}
