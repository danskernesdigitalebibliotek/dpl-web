"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import React, { useCallback, useEffect, useState } from "react"

import {
  TModalType,
  TModalUrlParams,
  clearModalSearchParams,
  parseModalSearchParams,
} from "@/lib/helpers/modal-url"

import LoanMaterialModal from "../loanMaterialModal/LoanMaterialModal"
import PlayerModal from "../playerModal/playerModal"
import PlayerPreviewModal from "../playerPreviewModal/playerPreviewModal"

export function DynamicModal() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const { modalType, modalProps } = parseModalSearchParams(searchParams)
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
    const params = clearModalSearchParams(new URLSearchParams(searchParams.toString()))
    const query = params.toString()
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }, [router, pathname, searchParams])

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
