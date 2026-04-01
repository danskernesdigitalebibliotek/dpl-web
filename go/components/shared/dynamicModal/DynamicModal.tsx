"use client"

import { useQueryStates } from "nuqs"
import React, { useCallback, useEffect, useState } from "react"

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
