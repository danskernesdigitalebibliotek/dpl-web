"use client"

import React from "react"

import { Button } from "@/components/shared/button/Button"
import { cyKeys } from "@/cypress/support/constants"
import { openModal } from "@/store/modal.store"

const OpenBookQuizButton = ({ children }: { children: React.ReactNode }) => (
  <Button
    theme="primary"
    size="lg"
    data-cy={cyKeys["open-book-quiz-button"]}
    onClick={() => openModal("BookQuizModal", {})}>
    {children}
  </Button>
)

export default OpenBookQuizButton
