"use client"

import React from "react"

import { Button } from "@/components/shared/button/Button"
import { cyKeys } from "@/cypress/support/constants"
import { openModal } from "@/store/modal.store"

type TOpenBookQuizButtonProps = {
  children: React.ReactNode
  theme?: "primary" | "secondary"
  className?: string
}

const OpenBookQuizButton = ({
  children,
  theme = "primary",
  className,
}: TOpenBookQuizButtonProps) => (
  <Button
    theme={theme}
    size="lg"
    className={className}
    data-cy={cyKeys["open-book-quiz-button"]}
    onClick={() => openModal("BookQuizModal", {})}>
    {children}
  </Button>
)

export default OpenBookQuizButton
