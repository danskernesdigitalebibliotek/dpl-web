import React from "react"

import { Button, ButtonProps } from "@/components/shared/button/Button"
import { cn } from "@/lib/helpers/helper.cn"

// Props pass through as one object: `asChild` and `ariaDisabled` are two arms
// of a union in ButtonProps, and destructuring them apart widens `asChild` to
// boolean, which no longer matches either arm.
//
// `size` is set below the spread and so cannot be overridden: every button on
// the work page is the same size.
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
