"use client"

import { useState } from "react"

import { Button, ButtonProps } from "./Button"
import LoadingDots from "./LoadingDots"

const ButtonWithLoadingStateHoc = <TProps extends ButtonProps>(
  Component: React.FC<TProps & { onClick?: () => void }>,
  {
    className,
    size,
    theme,
  }: {
    className?: string
    size?: "sm" | "lg"
    theme?: "primary" | "secondary"
  }
) => {
  return function WrappedComponent(props: TProps & { onClick?: () => void }) {
    const [isLoading, setIsLoading] = useState(false)
    const { onClick } = props

    const handleClick = () => {
      if (isLoading) {
        return
      }

      setIsLoading(true)
      if (onClick) {
        onClick()
      }
    }

    if (isLoading) {
      return (
        <Button size={size} className={className} theme={theme} disabled>
          <LoadingDots className="mx-6" />
        </Button>
      )
    }
    return (
      <Component
        {...(props as TProps & {
          onClick: typeof handleClick
        })}
        onClick={handleClick}
      />
    )
  }
}

export default ButtonWithLoadingStateHoc
