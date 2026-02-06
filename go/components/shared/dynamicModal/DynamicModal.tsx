"use client"

import { useSelector } from "@xstate/react"
import React from "react"

import { modalStore } from "@/store/modal.store"

import LoanMaterialModal from "../loanMaterialModal/LoanMaterialModal"
import PlayerModal from "../playerModal/playerModal"
import PlayerPreviewModal from "../playerPreviewModal/playerPreviewModal"

export const ModalComponentTypes = {
  LoanMaterialModal,
  PlayerPreviewModal,
  PlayerModal,
}

export function DynamicModal() {
  const open = useSelector(modalStore, state => state.context.open)
  const modalType = useSelector(modalStore, state => state.context.modalType)
  const props = useSelector(modalStore, state => state.context.props)

  const DynamicModalType =
    ModalComponentTypes[modalType as keyof typeof ModalComponentTypes] || null
  if (DynamicModalType === null) return null

  // TODO: figure out how to type props dynamically
  // @ts-ignore
  return <DynamicModalType open={open} {...props} />
}
