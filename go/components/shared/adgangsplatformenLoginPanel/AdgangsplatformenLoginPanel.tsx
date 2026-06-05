"use client"

import React from "react"

import { Button } from "@/components/shared/button/Button"
import Icon from "@/components/shared/icon/Icon"
import { cn } from "@/lib/helpers/helper.cn"

type AdgangsplatformenLoginPanelProps = {
  onLogin: () => void
  disabled?: boolean
  heading?: string
  description?: React.ReactNode
  className?: string
  dataCy?: string
}

const AdgangsplatformenLoginPanel = ({
  onLogin,
  disabled,
  heading = "Log ind med dit bibliotekslogin",
  description,
  className,
  dataCy,
}: AdgangsplatformenLoginPanelProps) => {
  return (
    <div
      className={cn(
        `bg-background-overlay flex flex-col items-center justify-center rounded-sm p-8
        text-center`,
        className
      )}>
      <Icon name="adgangsplatformen" className="mb-4" />
      <div className="text-typo-heading-4 text-foreground mb-6">{heading}</div>
      <Button
        theme="primary"
        size="lg"
        ariaLabel="Log ind med bibliotekslogin"
        onClick={onLogin}
        disabled={disabled}
        dataCy={dataCy}>
        LOG IND
      </Button>
      {description && (
        <p className="text-typo-body-sm text-foreground/70 mt-6">{description}</p>
      )}
    </div>
  )
}

export default AdgangsplatformenLoginPanel
