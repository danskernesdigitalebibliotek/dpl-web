"use client"

import React from "react"

import { Button } from "@/components/shared/button/Button"
import Icon from "@/components/shared/icon/Icon"
import { cn } from "@/lib/helpers/helper.cn"

type LoginPanelProps = {
  heading: string
  ariaLabel: string
  onLogin: () => void
  disabled?: boolean
  icon?: string
  description?: React.ReactNode
  className?: string
  dataCy?: string
}

const LoginPanel = ({
  heading,
  ariaLabel,
  onLogin,
  disabled,
  icon,
  description,
  className,
  dataCy,
}: LoginPanelProps) => {
  return (
    <div
      className={cn(
        `bg-background-overlay flex min-h-[300px] flex-col items-center justify-center rounded-sm
        p-8`,
        className
      )}>
      {icon && <Icon name={icon} className="mb-4" />}
      <div className="text-typo-heading-4 text-foreground mb-4 text-center">{heading}</div>
      <div>
        <Button
          theme="primary"
          ariaLabel={ariaLabel}
          onClick={onLogin}
          disabled={disabled}
          // eslint-disable-next-line no-restricted-syntax
          data-cy={dataCy}>
          LOG IND
        </Button>
      </div>
      {description && (
        <p className="text-typo-body-sm text-foreground/70 mt-6 text-center">{description}</p>
      )}
    </div>
  )
}

export default LoginPanel
