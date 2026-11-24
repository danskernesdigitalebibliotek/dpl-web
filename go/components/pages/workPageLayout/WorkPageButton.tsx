import React from "react"

import { Button, ButtonProps } from "@/components/shared/button/Button"
import { cn } from "@/lib/helpers/helper.cn"

// Props spread as one object to keep ButtonProps' asChild/ariaDisabled union
// intact. `size` is set after the spread and cannot be overridden.
function WorkPageButton({ className, dataCy, ...props }: ButtonProps) {
  return (
    <Button
      {...props}
      size="lg"
      className={cn("w-full lg:max-w-80 lg:min-w-72", className)}
      // eslint-disable-next-line no-restricted-syntax
      data-cy={dataCy}
    />
  )
}

export default WorkPageButton
