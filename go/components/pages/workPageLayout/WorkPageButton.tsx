import React from "react"

import { Button, ButtonProps } from "@/components/shared/button/Button"
import { cn } from "@/lib/helpers/helper.cn"

function WorkPageButton({
  ariaLabel,
  className,
  disabled,
  onClick,
  asChild = false,
  children,
  theme = "secondary",
}: ButtonProps) {
  return (
    <Button
      size={"lg"}
      className={cn("w-full lg:max-w-80 lg:min-w-72", className)}
      asChild={asChild}
      ariaLabel={ariaLabel}
      disabled={disabled}
      onClick={onClick}
      theme={theme}>
      {children}
    </Button>
  )
}

export default WorkPageButton
