"use client"

import React from "react"

import { Button } from "@/components/shared/button/Button"
import { openModal } from "@/store/modal.store"

const OpenBookQuizButton = ({ children }: { children: React.ReactNode }) => (
  <Button theme="primary" size="lg" onClick={() => openModal("BookQuizModal", {})}>
    {children}
  </Button>
)

export default OpenBookQuizButton
