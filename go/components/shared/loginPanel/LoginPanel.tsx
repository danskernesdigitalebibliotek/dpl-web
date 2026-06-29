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
        `bg-background-overlay flex min-h-[250px] flex-col items-center justify-center gap-y-5
        rounded-sm p-8 md:min-h-[300px]`,
        className
      )}>
      {icon && <Icon name={icon} className="mb-4" />}
      <div className="text-typo-heading-5 text-foreground text-center">{heading}</div>
      {description && (
        <p className="text-typo-body-sm text-foreground-muted text-center">{description}</p>
      )}
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
    </div>
  )
}

export default LoginPanel
